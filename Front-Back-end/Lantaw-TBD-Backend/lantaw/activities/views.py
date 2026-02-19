from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import Objective, Activity
from .serializers import ObjectiveReadSerializer, ObjectiveWriteSerializer, ActivitySerializer
from projects.models import Project
from history_log.models import HistoryLog

class IsAdminExecutiveOrProjectStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow public read access (GET, HEAD, OPTIONS) for list and retrieve actions
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write operations, require authentication
        if not request.user.is_authenticated:
            return False
        
        user = request.user

        if user.role == "ADMIN":
            return True
        # Read only
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        # Project Staff: Can perform write operations on activities/expenses
        if user.role == "PROJECT_STAFF":
            return True
        
        return False

    def has_object_permission(self, request, view, obj):
        # Allow public read access
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write operations, require authentication
        if not request.user.is_authenticated:
            return False
        
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

        # Public access: return all objectives for the project
        if not user.is_authenticated:
            return qs

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

        objective = serializer.save(project_id=project_id)
        
        # Track in history log for Admin - create directly instead of using signals
        if user.role == "ADMIN":
            from history_log.signals import get_objective_state
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=user,
                action='CREATE',
                change_type='OBJECTIVE',
                description=f"Created objective: {objective.title}",
                project=objective.project,
                entity_id=objective.id,
                old_state=None,
                new_state=get_objective_state(objective),
                related_change_request=None
            )
    
    def perform_update(self, serializer):
        """Handle objective update with history tracking."""
        objective = self.get_object()
        user = self.request.user
        
        # Get old state before update
        old_state = {
            'title': objective.title,
            'description': objective.description,
            'project': objective.project_id,
        }
        
        # Save the objective
        updated_objective = serializer.save()
        
        # Track in history log for Admin
        if user.role == "ADMIN":
            new_state = {
                'title': updated_objective.title,
                'description': updated_objective.description,
                'project': updated_objective.project_id,
            }
            
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=user,
                action='UPDATE',
                change_type='OBJECTIVE',
                description=f"Updated objective: {updated_objective.title}",
                project=updated_objective.project,
                entity_id=updated_objective.id,
                old_state=old_state,
                new_state=new_state,
                related_change_request=None
            )
    
    def perform_destroy(self, instance):
        """Handle objective deletion with history tracking."""
        user = self.request.user
        
        # Track in history log for Admin - create directly before deletion
        if user.role == "ADMIN":
            from history_log.signals import get_objective_state
            # Get state before deletion
            if hasattr(instance, 'project') and instance.project:
                HistoryLog.objects.create(
                    timestamp=timezone.now(),
                    user=user,
                    action='DELETE',
                    change_type='OBJECTIVE',
                    description=f"Deleted objective: {instance.title}",
                    project=instance.project,
                    entity_id=instance.id,
                    old_state=get_objective_state(instance),
                    new_state=None,
                    related_change_request=None
                )
        
        instance.delete()


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_queryset(self):
        user = self.request.user
        objective_pk = self.kwargs.get("objective_pk")

        # Get the activities related to the objective
        qs = Activity.objects.filter(objective_id=objective_pk)

        # Public access: return all activities for the objective
        if not user.is_authenticated:
            return qs

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
        activity = serializer.save(objective=objective)
        
        # Track in history log for Admin - create directly instead of using signals
        if self.request.user.role == "ADMIN":
            from history_log.signals import get_activity_state
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=self.request.user,
                action='CREATE',
                change_type='ACTIVITY',
                description=f"Created activity: {activity.title}",
                project=activity.objective.project,
                entity_id=activity.id,
                old_state=None,
                new_state=get_activity_state(activity),
                related_change_request=None
            )
    
    def perform_update(self, serializer):
        """Handle update with description tracking."""
        activity = self.get_object()
        user = self.request.user
        
        # Get old state before update
        old_state = {
            'title': activity.title,
            'activity_status': activity.activity_status,
            'projected_expense': str(activity.projected_expense) if activity.projected_expense else None,
            'actual_expense': str(activity.actual_expense) if activity.actual_expense else None,
            'activity_budget_item': activity.activity_budget_item_id,
            'objective': activity.objective_id,
        }
        
        # Get description from request data (for expense updates)
        description = self.request.data.get('description', None)
        
        # Save the activity
        updated_activity = serializer.save()
        
        # Track in history log
        if user.role == "ADMIN":
            # Direct Admin edit - create history log entry directly (like PROJECT_STAFF)
            new_state = {
                'title': updated_activity.title,
                'activity_status': updated_activity.activity_status,
                'projected_expense': str(updated_activity.projected_expense) if updated_activity.projected_expense else None,
                'actual_expense': str(updated_activity.actual_expense) if updated_activity.actual_expense else None,
                'activity_budget_item': updated_activity.activity_budget_item_id,
                'objective': updated_activity.objective_id,
            }
            
            # Check if this is an expense update (actual_expense changed)
            if old_state.get('actual_expense') != new_state.get('actual_expense'):
                history_description = description or f"Updated expense for activity: {updated_activity.title}"
            else:
                history_description = description or f"Updated activity: {updated_activity.title}"
            
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=user,
                action='UPDATE',
                change_type='ACTIVITY',
                description=history_description,
                project=updated_activity.objective.project,
                entity_id=updated_activity.id,
                old_state=old_state,
                new_state=new_state,
                related_change_request=None
            )
        elif user.role == "PROJECT_STAFF":
            # Project Staff direct edit - create history log entry
            new_state = {
                'title': updated_activity.title,
                'activity_status': updated_activity.activity_status,
                'projected_expense': str(updated_activity.projected_expense) if updated_activity.projected_expense else None,
                'actual_expense': str(updated_activity.actual_expense) if updated_activity.actual_expense else None,
                'activity_budget_item': updated_activity.activity_budget_item_id,
                'objective': updated_activity.objective_id,
            }
            
            # Check if this is an expense update (actual_expense changed)
            if old_state.get('actual_expense') != new_state.get('actual_expense'):
                # This is an expense update - use provided description
                history_description = description or f"Updated expense for activity: {updated_activity.title}"
            else:
                history_description = description or f"Updated activity: {updated_activity.title}"
            
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=user,
                action='UPDATE',
                change_type='ACTIVITY',
                description=history_description,
                project=updated_activity.objective.project,
                entity_id=updated_activity.id,
                old_state=old_state,
                new_state=new_state,
                related_change_request=None
            )
    
    def perform_destroy(self, instance):
        """Handle activity deletion with history tracking."""
        user = self.request.user
        
        # Track in history log for Admin - create directly before deletion
        if user.role == "ADMIN":
            from history_log.signals import get_activity_state
            # Get state before deletion
            if hasattr(instance, 'objective') and instance.objective:
                HistoryLog.objects.create(
                    timestamp=timezone.now(),
                    user=user,
                    action='DELETE',
                    change_type='ACTIVITY',
                    description=f"Deleted activity: {instance.title}",
                    project=instance.objective.project,
                    entity_id=instance.id,
                    old_state=get_activity_state(instance),
                    new_state=None,
                    related_change_request=None
                )
        
        instance.delete()