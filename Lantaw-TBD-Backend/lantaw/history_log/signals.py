"""
Django signals to automatically track changes in HistoryLog.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

from .models import HistoryLog
from change_requests.models import ChangeRequest
from activities.models import Activity, Objective
from personnel.models import Personnel, Role, Department
from budget.models import BudgetLineItem, Compensation
from projects.models import Project


# Track when ChangeRequests are approved
@receiver(post_save, sender=ChangeRequest)
def track_change_request_approval(sender, instance, created, **kwargs):
    """
    Create a HistoryLog entry when a ChangeRequest is approved.
    """
    try:
        # Only track when status changes to APPROVED
        if instance.status == 'APPROVED' and instance.approved_by and instance.project:
            # Check if HistoryLog entry already exists for this change request
            if not HistoryLog.objects.filter(related_change_request=instance).exists():
                # Determine action from operation
                action = instance.operation
                
                # Get old_state and new_state
                old_state = instance.current_state
                new_state = instance.proposed_changes
                
                # For CREATE operations, old_state is None
                if action == 'CREATE':
                    old_state = None
                
                HistoryLog.objects.create(
                    timestamp=instance.date_processed or timezone.now(),
                    user=instance.approved_by,  # Admin who approved
                    action=action,
                    change_type=instance.change_type,
                    description=instance.description or f"{instance.change_type} {action}",
                    project=instance.project,
                    entity_id=instance.entity_id,
                    old_state=old_state,
                    new_state=new_state,
                    related_change_request=instance
                )
    except Exception as e:
        # Log error but don't break the ChangeRequest save
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create HistoryLog entry for ChangeRequest {instance.id}: {str(e)}")


# Helper function to get entity state as dict
def get_activity_state(activity):
    """Get Activity state as dictionary."""
    return {
        'title': activity.title,
        'activity_status': activity.activity_status,
        'projected_expense': str(activity.projected_expense) if activity.projected_expense else None,
        'actual_expense': str(activity.actual_expense) if activity.actual_expense else None,
        'activity_budget_item': activity.activity_budget_item_id,
        'objective': activity.objective_id,
    }


def get_objective_state(objective):
    """Get Objective state as dictionary."""
    return {
        'title': objective.title,
        'description': objective.description,
        'project': objective.project_id,
    }


def get_personnel_state(personnel):
    """Get Personnel state as dictionary."""
    return {
        'first_name': personnel.first_name,
        'last_name': personnel.last_name,
        'role': personnel.role_id,
        'department': personnel.department_id,
        'employment_status': personnel.employment_status,
    }


def get_budget_item_state(budget_item):
    """Get BudgetLineItem state as dictionary."""
    return {
        'name': budget_item.name,
        'amount': str(budget_item.amount) if budget_item.amount else None,
        'project': budget_item.project_id,
    }


def get_compensation_state(compensation):
    """Get Compensation state as dictionary."""
    return {
        'type': compensation.type,
        'budget_item': compensation.budget_item_id,
        'personnel': compensation.personnel_id,
        'reason': compensation.reason,
        'amount': str(compensation.amount) if compensation.amount else None,
        'date_effective': compensation.date_effective.isoformat() if compensation.date_effective else None,
    }


def get_role_state(role):
    """Get Role state as dictionary."""
    return {
        'name': role.name,
        'project': role.project_id,
    }


def get_department_state(department):
    """Get Department state as dictionary."""
    return {
        'name': department.name,
        'project': department.project_id,
    }


def get_project_state(project):
    """Get Project state as dictionary."""
    return {
        'name': project.name,
        'project_leader': project.project_leader,
        'description': project.description,
        'grant_amount': str(project.grant_amount) if project.grant_amount else None,
        'project_status': project.project_status,
        'date_start': project.date_start.isoformat() if project.date_start else None,
        'date_end': project.date_end.isoformat() if project.date_end else None,
    }


# Store previous state before save (for UPDATE tracking)
_previous_states = {}


@receiver(post_save, sender=Activity)
def track_activity_changes(sender, instance, created, **kwargs):
    """
    Track Activity changes (only for direct Admin edits, not change requests).
    """
    try:
        # Skip if this is from a change request (will be tracked separately)
        if hasattr(instance, '_skip_history_tracking'):
            return
        
        # Get the user from request if available (set in view)
        user = getattr(instance, '_history_user', None)
        if not user or not hasattr(user, 'role') or user.role != 'ADMIN':
            return  # Only track direct Admin edits
        
        if not hasattr(instance, 'objective') or not instance.objective:
            return  # Can't track without objective
        
        if created:
            # CREATE
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=user,
                action='CREATE',
                change_type='ACTIVITY',
                description=f"Created activity: {instance.title}",
                project=instance.objective.project,
                entity_id=instance.id,
                old_state=None,
                new_state=get_activity_state(instance),
                related_change_request=None
            )
        else:
            # UPDATE
            old_state = _previous_states.get(f'activity_{instance.id}')
            if old_state:
                HistoryLog.objects.create(
                    timestamp=timezone.now(),
                    user=user,
                    action='UPDATE',
                    change_type='ACTIVITY',
                    description=getattr(instance, '_history_description', f"Updated activity: {instance.title}"),
                    project=instance.objective.project,
                    entity_id=instance.id,
                    old_state=old_state,
                    new_state=get_activity_state(instance),
                    related_change_request=None
                )
                # Clean up
                _previous_states.pop(f'activity_{instance.id}', None)
    except Exception as e:
        # Log error but don't break the Activity save
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create HistoryLog entry for Activity {instance.id if hasattr(instance, 'id') else 'unknown'}: {str(e)}")


@receiver(post_save, sender=Objective)
def track_objective_changes(sender, instance, created, **kwargs):
    """Track Objective changes (only for direct Admin edits)."""
    try:
        if hasattr(instance, '_skip_history_tracking'):
            return
        
        user = getattr(instance, '_history_user', None)
        if not user or not hasattr(user, 'role') or user.role != 'ADMIN':
            return
        
        if not hasattr(instance, 'project') or not instance.project:
            return  # Can't track without project
        
        if created:
            HistoryLog.objects.create(
                timestamp=timezone.now(),
                user=user,
                action='CREATE',
                change_type='OBJECTIVE',
                description=f"Created objective: {instance.title}",
                project=instance.project,
                entity_id=instance.id,
                old_state=None,
                new_state=get_objective_state(instance),
                related_change_request=None
            )
        else:
            old_state = _previous_states.get(f'objective_{instance.id}')
            if old_state:
                HistoryLog.objects.create(
                    timestamp=timezone.now(),
                    user=user,
                    action='UPDATE',
                    change_type='OBJECTIVE',
                    description=getattr(instance, '_history_description', f"Updated objective: {instance.title}"),
                    project=instance.project,
                    entity_id=instance.id,
                    old_state=old_state,
                    new_state=get_objective_state(instance),
                    related_change_request=None
                )
                _previous_states.pop(f'objective_{instance.id}', None)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create HistoryLog entry for Objective {instance.id if hasattr(instance, 'id') else 'unknown'}: {str(e)}")


@receiver(post_delete, sender=Activity)
def track_activity_deletion(sender, instance, **kwargs):
    """Track Activity deletion (only for direct Admin deletes)."""
    try:
        if hasattr(instance, '_skip_history_tracking'):
            return
        
        user = getattr(instance, '_history_user', None)
        if not user or not hasattr(user, 'role') or user.role != 'ADMIN':
            return
        
        if not hasattr(instance, 'objective') or not instance.objective:
            return  # Can't track without objective
        
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
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create HistoryLog entry for Activity deletion {instance.id if hasattr(instance, 'id') else 'unknown'}: {str(e)}")


@receiver(post_delete, sender=Objective)
def track_objective_deletion(sender, instance, **kwargs):
    """Track Objective deletion (only for direct Admin deletes)."""
    try:
        if hasattr(instance, '_skip_history_tracking'):
            return
        
        user = getattr(instance, '_history_user', None)
        if not user or not hasattr(user, 'role') or user.role != 'ADMIN':
            return
        
        if not hasattr(instance, 'project') or not instance.project:
            return  # Can't track without project
        
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
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create HistoryLog entry for Objective deletion {instance.id if hasattr(instance, 'id') else 'unknown'}: {str(e)}")

