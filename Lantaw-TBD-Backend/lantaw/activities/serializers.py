from rest_framework import serializers
from .models import Objective, Activity
from budget.models import BudgetLineItem
from projects.models import Project 

class ActivitySerializer(serializers.ModelSerializer):
    # Write: accept IDs (allow null since model allows it)
    activity_budget_item = serializers.PrimaryKeyRelatedField(
        queryset=BudgetLineItem.objects.all(),
        allow_null=True,
        required=False
    )
    
    # Read: show name of budget item too (without breaking POST)
    budget_item_name = serializers.CharField(source="activity_budget_item.name", read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "title",
            "activity_status",
            "activity_budget_item",
            "budget_item_name",   
            "date_created",
            "date_modified",
            "projected_expense",
            "actual_expense",
        ]
        read_only_fields = ("objective",) 

class ObjectiveReadSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True, source="activity_set")
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Objective
        fields = ["id", "project", "project_name", "title", "description", "activities"]

class ObjectiveWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        fields = ["id", "project", "title", "description"] 
        read_only_fields = ("project",)