from django.db import models
from projects.models import Project
from users.models import User
from change_requests.models import ChangeRequest


class HistoryLog(models.Model):
    """
    Model to track all changes in the system, including approved change requests
    and direct Admin edits.
    """
    
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('REVERT', 'Revert'),
    ]
    
    CHANGE_TYPE_CHOICES = [
        ('ACTIVITY', 'Activity'),
        ('OBJECTIVE', 'Objective'),
        ('PERSONNEL', 'Personnel'),
        ('BUDGET', 'Budget'),
        ('COMPENSATION', 'Compensation'),
        ('PROJECT', 'Project'),
        ('ROLE', 'Role'),
        ('DEPARTMENT', 'Department'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='history_log_entries')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    description = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='history_log_entries')
    entity_id = models.IntegerField(null=True, blank=True)  # ID of the changed entity
    old_state = models.JSONField(null=True, blank=True)  # Previous state
    new_state = models.JSONField(null=True, blank=True)  # New state
    related_change_request = models.ForeignKey(
        ChangeRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='history_log_entries'
    )
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['project', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['change_type', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.change_type} {self.action} - {self.project.name} ({self.timestamp})"

