from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Objective, Activity
from .serializers import ObjectiveReadSerializer, ObjectiveWriteSerializer, ActivitySerializer
from projects.models import Project

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
        if user.role == "PROJECT_STAFF":
            return request.method in permissions.SAFE_METHODS
        
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == "ADMIN":
            return True
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        # Check if the current user is a member of the project related to the objective or activity
        if user.role == "PROJECT_STAFF":
            if isinstance(obj, Objective):
                return obj.project.projectmembers_set.filter(user=user).exists()
            if isinstance(obj, Activity):
                return obj.objective.project.projectmembers_set.filter(user=user).exists()
        return False

class ObjectiveViewSet(viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_serializer_class(self):
        """
        Use separate serializers for read vs write operations.
        """
        if self.action in ["create", "update", "partial_update"]:
            return ObjectiveWriteSerializer
        return ObjectiveReadSerializer
    
    def get_queryset(self):
        user = self.request.user
        project_pk = self.kwargs.get("project_pk")

        # Get the objectives related to the project 
        qs = Objective.objects.filter(project_id=project_pk) 

        if user.role == "ADMIN":
            return qs
        elif user.role == "EXECUTIVE":
            return qs
        elif user.role == "PROJECT_STAFF":
            # Verifies if the user is a member of the project and return objectives if true
            return qs.filter(project__projectmembers__user=user)
        return Objective.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        project_id = self.kwargs.get("project_pk")
        project = Project.objects.get(pk=project_id)

        if project:
            if user.role == "PROJECT_STAFF" and not project.projectmembers_set.filter(user=user).exists():
                raise PermissionDenied()

        serializer.save(project_id=project_id)


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_queryset(self):
        user = self.request.user
        objective_pk = self.kwargs.get("objective_pk")

        # Get the activities related to the objective
        qs = Activity.objects.filter(objective_id=objective_pk)

        if user.role == "ADMIN":
            return qs
        elif user.role == "EXECUTIVE":
            return qs
        elif user.role == "PROJECT_STAFF":
            # Verifies if the user is a member of the project and return activities if true
            return qs.filter(objective__project__projectmembers__user=user)
        return Activity.objects.none()

    def perform_create(self, serializer):
        objective_id = self.kwargs.get("objective_pk")
        objective = Objective.objects.get(pk=objective_id)  # fetch instance
        serializer.save(objective=objective)