from django.db import models
from projects.models import Project
from users.models import User


class ChangeRequest(models.Model):
    """
    Model to represent a change request submitted by Project Staff
    that requires Admin approval before being applied to project data.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELED', 'Canceled'),
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
    
    OPERATION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_change_requests')
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    operation = models.CharField(max_length=10, choices=OPERATION_CHOICES)  # CREATE, UPDATE, or DELETE
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    description = models.TextField()
    
    # Reference to the entity being changed (null for CREATE operations)
    entity_id = models.IntegerField(null=True, blank=True)  # ID of activity, personnel, objective, etc.
    
    # Current state (for UPDATE/DELETE operations) - stored as JSON
    current_state = models.JSONField(null=True, blank=True)
    
    # Proposed changes - stored as JSON
    proposed_changes = models.JSONField()
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_change_requests')
    date_submitted = models.DateTimeField(auto_now_add=True)
    date_processed = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    cancel_reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date_submitted']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['submitted_by', 'status']),
        ]
    
    def __str__(self):
        return f"{self.change_type} {self.operation} - {self.project.name} ({self.status})"
