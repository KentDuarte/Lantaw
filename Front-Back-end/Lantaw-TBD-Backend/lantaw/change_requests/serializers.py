from rest_framework import serializers
from .models import ChangeRequest
from projects.serializers import ProjectSerializer


class ChangeRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for ChangeRequest model with nested user names and project name.
    """
    submitted_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ChangeRequest
        fields = [
            'id',
            'project',
            'project_name',
            'submitted_by',
            'submitted_by_name',
            'change_type',
            'operation',
            'status',
            'description',
            'entity_id',
            'current_state',
            'proposed_changes',
            'approved_by',
            'approved_by_name',
            'date_submitted',
            'date_processed',
            'rejection_reason',
            'cancel_reason',
        ]
        read_only_fields = [
            'id',
            'submitted_by',
            'date_submitted',
            'date_processed',
            'approved_by',
            'approved_by_name',
            'project_name',
            'submitted_by_name',
        ]
    
    def get_submitted_by_name(self, obj):
        """Return full name of the user who submitted the request."""
        if obj.submitted_by:
            return f"{obj.submitted_by.first_name} {obj.submitted_by.last_name}".strip()
        return None
    
    def get_approved_by_name(self, obj):
        """Return full name of the admin who approved/rejected the request."""
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}".strip()
        return None
    
    def get_project_name(self, obj):
        """Return the project name."""
        if obj.project:
            return obj.project.name
        return None
    
    def validate(self, data):
        """Validate operation-specific requirements."""
        operation = data.get('operation', self.instance.operation if self.instance else None)
        entity_id = data.get('entity_id', self.instance.entity_id if self.instance else None)
        
        # CREATE operations must have entity_id as null
        if operation == 'CREATE' and entity_id is not None:
            raise serializers.ValidationError({
                'entity_id': 'entity_id must be null for CREATE operations'
            })
        
        # UPDATE/DELETE operations must have entity_id
        if operation in ['UPDATE', 'DELETE'] and entity_id is None:
            raise serializers.ValidationError({
                'entity_id': 'entity_id is required for UPDATE and DELETE operations'
            })
        
        return data

