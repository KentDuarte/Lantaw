from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import ChangeRequest
from .serializers import ChangeRequestSerializer
from .permissions import IsProjectStaffOrAdmin, IsAdminOnly, CanSubmitChangeRequest
from .utils import apply_change_request
from projects.models import Project


class ChangeRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChangeRequest model.
    Supports both nested routing (under projects) and top-level routing (Admin only).
    """
    queryset = ChangeRequest.objects.all()
    serializer_class = ChangeRequestSerializer
    
    def get_permissions(self):
        """
        Assign permissions based on action.
        """
        if self.action in ['approve', 'reject']:
            return [IsAdminOnly()]
        elif self.action == 'create':
            return [CanSubmitChangeRequest()]
        else:
            return [IsProjectStaffOrAdmin()]
    
    def get_queryset(self):
        """
        Filter queryset based on user role and routing context.
        """
        user = self.request.user
        project_pk = self.kwargs.get('project_pk')
        
        # If nested under projects, filter by project
        if project_pk:
            qs = ChangeRequest.objects.filter(project_id=project_pk)
        else:
            # Top-level endpoint - Admin sees all, Project Staff sees only their own
            if user.role == "ADMIN":
                qs = ChangeRequest.objects.all()
            elif user.role == "PROJECT_STAFF":
                qs = ChangeRequest.objects.filter(submitted_by=user)
            else:
                qs = ChangeRequest.objects.none()
        
        # Apply filters from query parameters
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        change_type_filter = self.request.query_params.get('change_type', None)
        if change_type_filter:
            qs = qs.filter(change_type=change_type_filter)
        
        operation_filter = self.request.query_params.get('operation', None)
        if operation_filter:
            qs = qs.filter(operation=operation_filter)
        
        return qs.order_by('-date_submitted')
    
    def perform_create(self, serializer):
        """
        Set submitted_by to current user and validate project assignment.
        """
        user = self.request.user
        project_pk = self.kwargs.get('project_pk') or serializer.validated_data.get('project')
        
        if not project_pk:
            raise ValidationError({'project': 'Project is required'})
        
        # Validate project exists
        project = get_object_or_404(Project, pk=project_pk)
        
        # For Project Staff, validate they're assigned to the project
        if user.role == "PROJECT_STAFF":
            from projects.models import ProjectMembers
            if not ProjectMembers.objects.filter(project=project, user=user).exists():
                raise PermissionDenied("You are not assigned to this project.")
        
        serializer.save(submitted_by=user, project=project)
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None, project_pk=None):
        """
        Approve a change request. Only Admin can approve.
        """
        change_request = self.get_object()
        
        # Validate status
        if change_request.status != 'PENDING':
            return Response(
                {'error': f'Cannot approve change request with status {change_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use select_for_update to prevent concurrent approvals
        with transaction.atomic():
            change_request = ChangeRequest.objects.select_for_update().get(pk=change_request.pk)
            
            # Double-check status after locking
            if change_request.status != 'PENDING':
                return Response(
                    {'error': f'Change request status changed to {change_request.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Apply the changes
                apply_change_request(change_request)
                
                # Update change request status
                change_request.status = 'APPROVED'
                change_request.approved_by = request.user
                change_request.date_processed = timezone.now()
                change_request.save()
                
                serializer = self.get_serializer(change_request)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            except Exception as e:
                return Response(
                    {'error': f'Failed to apply changes: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None, project_pk=None):
        """
        Reject a change request. Only Admin can reject.
        """
        change_request = self.get_object()
        
        # Validate status
        if change_request.status != 'PENDING':
            return Response(
                {'error': f'Cannot reject change request with status {change_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get rejection reason from request
        rejection_reason = request.data.get('rejection_reason', '')
        
        # Use select_for_update to prevent concurrent rejections
        with transaction.atomic():
            change_request = ChangeRequest.objects.select_for_update().get(pk=change_request.pk)
            
            # Double-check status after locking
            if change_request.status != 'PENDING':
                return Response(
                    {'error': f'Change request status changed to {change_request.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update change request status
            change_request.status = 'REJECTED'
            change_request.approved_by = request.user
            change_request.date_processed = timezone.now()
            change_request.rejection_reason = rejection_reason
            change_request.save()
            
            serializer = self.get_serializer(change_request)
            return Response(serializer.data, status=status.HTTP_200_OK)
