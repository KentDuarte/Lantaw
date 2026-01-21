from rest_framework import viewsets, permissions, status 
from rest_framework.response import Response
from .models import Personnel, Role, Department
from .serializers import PersonnelSerializer, RoleSerializer, DepartmentSerializer
from rest_framework.exceptions import PermissionDenied, ValidationError
from projects.models import Project, ProjectMembers, ProjectPersonnel
from django.shortcuts import get_object_or_404
from django.db import transaction

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

        if user.role == "ADMIN":
            return True
        # Project Staff: Read-only access (must use Change Requests for edits)
        if user.role == "PROJECT_STAFF":
            return request.method in permissions.SAFE_METHODS
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

    def create(self, request, *args, **kwargs):
        """Override create to properly handle response after ProjectPersonnel creation."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Refresh the personnel object from database with select_related to prefetch relationships
        # This ensures role and department are properly loaded for serialization
        personnel = Personnel.objects.select_related('role', 'department').get(pk=serializer.instance.pk)
        
        # Create a new serializer instance with the refreshed object
        response_serializer = self.get_serializer(personnel)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @transaction.atomic
    def perform_create(self, serializer):
        """
        Create Personnel record and ProjectPersonnel relationship.
        Also validates that role and department belong to the current project.
        """
        project_id = self.kwargs.get("project_pk")
        if not project_id:
            raise ValidationError({'project': 'Project ID is required.'})
        
        # Convert to int if it's a string
        try:
            project_id = int(project_id)
        except (ValueError, TypeError):
            raise ValidationError({'project': 'Invalid project ID.'})
        
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise ValidationError({'project': 'Project not found.'})
        
        # Validate role and department belong to this project
        # Extract IDs - handle both integer IDs and object instances
        role_value = serializer.validated_data.get('role')
        department_value = serializer.validated_data.get('department')
        
        # Convert to ID if it's an object instance (DRF might resolve FK to object)
        if role_value is not None:
            role_id = role_value.pk if hasattr(role_value, 'pk') else role_value
            if not isinstance(role_id, int):
                # If still not an int, try to convert
                try:
                    role_id = int(role_id)
                except (ValueError, TypeError):
                    raise ValidationError({'role': 'Invalid role ID.'})
            try:
                role = Role.objects.get(pk=role_id, project_id=project_id)
            except Role.DoesNotExist:
                raise ValidationError({'role': 'Role not found or does not belong to this project.'})
        
        if department_value is not None:
            department_id = department_value.pk if hasattr(department_value, 'pk') else department_value
            if not isinstance(department_id, int):
                # If still not an int, try to convert
                try:
                    department_id = int(department_id)
                except (ValueError, TypeError):
                    raise ValidationError({'department': 'Invalid department ID.'})
            try:
                department = Department.objects.get(pk=department_id, project_id=project_id)
            except Department.DoesNotExist:
                raise ValidationError({'department': 'Department not found or does not belong to this project.'})
        
        # Create the personnel record
        personnel = serializer.save()
        
        # Create the ProjectPersonnel relationship
        ProjectPersonnel.objects.get_or_create(
            personnel=personnel,
            project=project
        )