from rest_framework import viewsets, permissions, status 
from .models import Personnel, Role, Department
from .serializers import PersonnelSerializer, RoleSerializer, DepartmentSerializer
from rest_framework.exceptions import PermissionDenied
from projects.models import Project, ProjectMembers
from django.shortcuts import get_object_or_404

# Class Permission based on User Role generalized
class IsAdminExecutiveOrProjectStaff(permissions.BasePermission):
    """
    Admin: Full access
    Executive: Read-only
    Project Staff: Only personnel in their projects
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user = request.user

        if user.role in ["ADMIN", "PROJECT_STAFF"]:
            return True
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == "ADMIN":
            return True
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        # Project Staff: only if part of the same project
        if user.role == "PROJECT_STAFF":
            return ProjectMembers.objects.filter(
                project=obj.project,
                user=user
            ).exists()
        return False

class ProjectPermissionMixin:
    def perform_create(self, serializer):
        """
        Assign the object's project based on the project_id in the URL upon creation.
        Also checks if the user has permission to create in that project.
        """

        project_id = self.kwargs.get("project_pk")
        user = self.request.user

        # If user is not part of the project and not admin/executive, deny
        if not ProjectMembers.objects.filter(project_id=project_id, user=user).exists() \
           and user.role not in ["ADMIN", "EXECUTIVE"]:
            raise PermissionDenied("You are not allowed to create for this project.")

        project = get_object_or_404(Project, pk=project_id)
        serializer.save(project=project)

    def get_project_queryset(self, model):
        """
        Returns queryset filtered by project and user permissions.
        """

        project_id = self.kwargs.get("project_pk")
        user = self.request.user

        # Base queryset items that belong to this project
        qs = model.objects.filter(project_id=project_id).distinct()

        # Admins and Executives can view all items
        if user.role in ["ADMIN", "EXECUTIVE"]:
            return qs

        # Project Staff can only view if member of this project
        elif user.role == "PROJECT_STAFF":
            is_member = ProjectMembers.objects.filter(
                project_id=project_id, user=user
            ).exists()
            return qs if is_member else model.objects.none()

        # Otherwise, no access
        return model.objects.none()

class RoleViewSet(ProjectPermissionMixin, viewsets.ModelViewSet): 
    serializer_class = RoleSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_queryset(self):
        return self.get_project_queryset(Role)
    
class DepartmentViewSet(ProjectPermissionMixin, viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_queryset(self):
        return self.get_project_queryset(Department)

class PersonnelViewSet(viewsets.ModelViewSet):
    serializer_class = PersonnelSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_queryset(self):
        project_id = self.kwargs.get("project_pk")
        user = self.request.user

        # Base queryset items that belong to this project
        qs = Personnel.objects.filter(projectpersonnel__project_id=project_id)

        if user.role in ["ADMIN", "EXECUTIVE"]:
            return qs
        # Project Staff can only see personnel in their projects
        elif user.role == "PROJECT_STAFF":
            return qs.filter(
                projectpersonnel__project__projectmembers__user=user
            )
        return Personnel.objects.none()