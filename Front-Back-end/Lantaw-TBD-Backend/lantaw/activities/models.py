from django.db import models
from projects.models import Project
from budget.models import BudgetLineItem

class Objective(models.Model):
    """
    Model to represent project objectives.
    Fields:
    - project: Foreign key to the Project model.
    - title: Title of the objective.
    - description: Detailed description of the objective.
    """

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=False)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.project.name}"

class Activity(models.Model):
    """
    Model to represent activities under a specific objective.
    Fields:
    - objective: Foreign key to the Objective model.
    - title: Title of the activity.
    - activity_status: Current status of the activity (e.g., Active, Pending, In Progress).
    - activity_budget_item: Foreign key to the BudgetLineItem model (e.g., MOOE, PS, CO).
    - date_created: Timestamp of when the activity was created.
    - date_modified: Timestamp of the most recent modification.
    - projected_expense: Estimated cost for the activity.
    - actual_expense: Actual cost incurred for the activity.
    """
    
    ACTIVITY_STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
    ]

    objective = models.ForeignKey(Objective, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=False)
    activity_status = models.CharField(
        max_length=20,
        choices=ACTIVITY_STATUS_CHOICES,
        default='PENDING',
    )
    activity_budget_item = models.ForeignKey(BudgetLineItem, on_delete=models.SET_NULL, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    projected_expense = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_expense = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.objective.title} ({self.activity_status})"

