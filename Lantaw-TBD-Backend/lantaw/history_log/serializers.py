from rest_framework import serializers
from .models import HistoryLog


class HistoryLogSerializer(serializers.ModelSerializer):
    """
    Serializer for HistoryLog model with computed fields for user name and project name.
    """
    user_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    
    class Meta:
        model = HistoryLog
        fields = [
            'id',
            'timestamp',
            'user',
            'user_name',
            'action',
            'change_type',
            'description',
            'project',
            'project_name',
            'entity_id',
            'old_state',
            'new_state',
            'related_change_request',
        ]
        read_only_fields = [
            'id',
            'timestamp',
            'user_name',
            'project_name',
        ]
    
    def get_user_name(self, obj):
        """Return full name of the user who made the change."""
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return None
    
    def get_project_name(self, obj):
        """Return the project name."""
        if obj.project:
            return obj.project.name
        return None

