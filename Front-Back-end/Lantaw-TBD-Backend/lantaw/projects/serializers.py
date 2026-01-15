from rest_framework import serializers
from .models import Project, ProjectMembers

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 
            'name', 
            'description', 
            'grant_amount',
            'project_status',
            "date_start",
            "date_end",
        ]

class ProjectMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMembers
        fields = ['id', 'user', 'project', 'date_joined']
        read_only_fields = ['date_joined']