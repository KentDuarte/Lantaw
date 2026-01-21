from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Project, ProjectMembers
from .serializers import ProjectSerializer, ProjectMembersSerializer

class IsAdminExecutiveOrProjectStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user = request.user

        if user.role == "ADMIN":
            return True
        # Read only
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        # Project Staff: Read-only access (must use Change Requests for edits)
        # Exception: Project Staff can still create projects (handled in perform_create)
        if user.role == "PROJECT_STAFF":
            if request.method == "POST":
                # Allow POST for project creation (Admin assigns Project Staff)
                return True
            return request.method in permissions.SAFE_METHODS
        
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == "ADMIN":
            return True
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        # Check if the current user is a member of the project
        if user.role == "PROJECT_STAFF":
            return obj.projectmembers_set.filter(user=user).exists()
        return False

class IsAdminOnly(permissions.BasePermission):
    """
    Only ADMIN users can access ProjectMembers.
    """
    def has_permission(self, request, view):
        # Only allow authenticated ADMIN users
        return request.user.is_authenticated and request.user.role == "ADMIN"

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.role == "ADMIN"

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_queryset(self):
        user = self.request.user
        project_pk = self.kwargs.get("project_pk")

        if user.role == "ADMIN":
            return Project.objects.all()
        elif user.role == "EXECUTIVE":
            return Project.objects.all()
        elif user.role == "PROJECT_STAFF":
            # Staff only sees projects they belong to
            qs = Project.objects.filter(projectmembers__user=user)
            if project_pk:
                return qs.filter(id=project_pk)
            return qs
        return Project.objects.none()
    
    def perform_create(self, serializer):
        project = serializer.save()

        user = self.request.user
        if user.role in ["ADMIN", "PROJECT_STAFF"]:
            ProjectMembers.objects.get_or_create(
                user=user,
                project=project
            )

class ProjectMembersViewSet(viewsets.ModelViewSet):
    queryset = ProjectMembers.objects.all()
    serializer_class = ProjectMembersSerializer
    permission_classes = [IsAdminOnly]

    def get_queryset(self):
        """
        Only ADMINs can see members, optionally filtered by project.
        """
        project_pk = self.kwargs.get("project_pk")
        qs = self.queryset
        if project_pk:
            qs = qs.filter(project_id=project_pk)
        return qs


@api_view(["GET"])
@permission_classes([AllowAny])
def public_projects_list(request):
    """
    Public, read-only list of projects (names only).
    No authentication required.
    """
    projects = Project.objects.all().order_by("id")
    data = [{"id": project.id, "name": project.name, "project_leader": project.project_leader} for project in projects]
    return Response(data)