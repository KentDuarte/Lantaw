from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date

from .models import HistoryLog
from .serializers import HistoryLogSerializer
from .permissions import IsAdminExecutiveOrProjectStaff
from .utils import revert_history_entry


class HistoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for HistoryLog model.
    Read-only for all users, revert action available for Admin only.
    """
    queryset = HistoryLog.objects.all()
    serializer_class = HistoryLogSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]
    
    def get_queryset(self):
        """
        Filter queryset based on user role and query parameters.
        """
        user = self.request.user
        qs = HistoryLog.objects.all()
        
        # Apply filters from query parameters
        project_filter = self.request.query_params.get('project', None)
        if project_filter:
            qs = qs.filter(project_id=project_filter)
        
        change_type_filter = self.request.query_params.get('change_type', None)
        if change_type_filter:
            qs = qs.filter(change_type=change_type_filter)
        
        action_filter = self.request.query_params.get('action', None)
        if action_filter:
            qs = qs.filter(action=action_filter)
        
        user_filter = self.request.query_params.get('user', None)
        if user_filter:
            qs = qs.filter(user_id=user_filter)
        
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            parsed = parse_date(date_from)
            if parsed:
                qs = qs.filter(timestamp__date__gte=parsed)
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            parsed = parse_date(date_to)
            if parsed:
                qs = qs.filter(timestamp__date__lte=parsed)
        
        # For Project Staff, only show entries for their projects
        if user.is_authenticated and hasattr(user, 'role') and user.role == "PROJECT_STAFF":
            from projects.models import ProjectMembers
            user_projects = ProjectMembers.objects.filter(user=user).values_list('project_id', flat=True)
            qs = qs.filter(project_id__in=user_projects)
        
        return qs.order_by('-timestamp')
    
    @action(detail=True, methods=['post'], url_path='revert')
    def revert(self, request, pk=None):
        """
        Revert a history log entry. Only Admin can revert.
        Creates a new HistoryLog entry with action='REVERT' to track the revert.
        """
        history_entry = self.get_object()
        
        # Validate that this entry can be reverted
        if history_entry.action == 'REVERT':
            return Response(
                {'error': 'Cannot revert a revert action'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure atomicity
        with transaction.atomic():
            try:
                # Revert the change
                reverted_entity = revert_history_entry(history_entry)
                
                # Create a new HistoryLog entry to track the revert
                revert_entry = HistoryLog.objects.create(
                    timestamp=timezone.now(),
                    user=request.user,
                    action='REVERT',
                    change_type=history_entry.change_type,
                    description=f"Reverted: {history_entry.description}",
                    project=history_entry.project,
                    entity_id=history_entry.entity_id,
                    old_state=history_entry.new_state,  # Current state becomes old
                    new_state=history_entry.old_state,  # Previous state becomes new
                    related_change_request=None
                )
                
                serializer = self.get_serializer(revert_entry)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': f'Failed to revert: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

