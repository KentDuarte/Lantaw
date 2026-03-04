from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
import decimal

from .models import ChangeRequest
from .serializers import ChangeRequestSerializer
from .permissions import IsProjectStaffOrAdmin, IsAdminOnly, CanSubmitChangeRequest
from .utils import apply_change_request
from projects.models import Project


def get_changed_fields(current_state, proposed_changes):
    """
    Helper function to get the set of fields that are being changed.
    Returns a set of field names that differ between current_state and proposed_changes.
    """
    if not current_state or not proposed_changes:
        return set()
    
    changed_fields = set()
    
    # Get all keys from both dictionaries
    all_keys = set(list(current_state.keys()) + list(proposed_changes.keys()))
    
    field_labels = {
        'name': 'Project Name',
        'project_leader': 'Project Leader',
        'description': 'Description',
        'date_start': 'Start Date',
        'date_end': 'End Date',
        'grant_amount': 'Grant Amount',
    }
    
    for key in all_keys:
        current_value = current_state.get(key)
        proposed_value = proposed_changes.get(key)
        
        # Special handling for grant_amount (decimal field)
        if key == 'grant_amount':
            try:
                current_num = float(current_value) if current_value not in (None, '') else 0.0
                proposed_num = float(proposed_value) if proposed_value not in (None, '') else 0.0
                if abs(current_num - proposed_num) > 0.01:
                    changed_fields.add(key)
            except (ValueError, TypeError):
                # If conversion fails, compare as strings
                if str(current_value or '').strip() != str(proposed_value or '').strip():
                    changed_fields.add(key)
            continue
        
        # Normalize values for comparison
        def normalize_value(val):
            if val is None:
                return ""
            if isinstance(val, (int, float, decimal.Decimal)):
                return val
            return str(val).strip()
        
        normalized_current = normalize_value(current_value)
        normalized_proposed = normalize_value(proposed_value)
        
        if normalized_current != normalized_proposed:
            changed_fields.add(key)
    
    return changed_fields


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
        
        # Check for field-level conflicts with pending change requests
        change_type = serializer.validated_data.get('change_type')
        operation = serializer.validated_data.get('operation')
        
        # Project Staff cannot submit ACTIVITY change requests (they can edit directly)
        if user.role == "PROJECT_STAFF" and change_type == "ACTIVITY":
            raise PermissionDenied(
                "Project Staff can directly create, update, and delete activities. "
                "Change requests are not required for activity operations."
            )
        entity_id = serializer.validated_data.get('entity_id')
        current_state = serializer.validated_data.get('current_state')
        proposed_changes = serializer.validated_data.get('proposed_changes')
        
        # Field labels for different change types
        field_labels_map = {
            'PROJECT': {
                'name': 'Project Name',
                'project_leader': 'Project Leader',
                'description': 'Description',
                'date_start': 'Start Date',
                'date_end': 'End Date',
                'grant_amount': 'Grant Amount',
            },
            'OBJECTIVE': {
                'title': 'Title',
                'description': 'Description',
            },
            'ACTIVITY': {
                'title': 'Title',
                'activity_status': 'Activity Status',
                'projected_expense': 'Projected Expense',
                'actual_expense': 'Actual Expense',
                'activity_budget_item': 'Budget Item',
            },
            'PERSONNEL': {
                'first_name': 'First Name',
                'last_name': 'Last Name',
                'role': 'Role',
                'department': 'Department',
                'employment_status': 'Employment Status',
            },
            'COMPENSATION': {
                'type': 'Type',
                'budget_item': 'Budget Item',
                'personnel': 'Personnel',
                'reason': 'Reason',
                'amount': 'Amount',
                'date_effective': 'Date Effective',
            },
        }
        
        # Get pending requests for the same change type and project
        pending_requests = ChangeRequest.objects.filter(
            project=project,
            change_type=change_type,
            status='PENDING'
        )
        
        # For DELETE operations, check if same entity already has pending DELETE
        if operation == 'DELETE' and entity_id:
            has_pending_delete = pending_requests.filter(
                entity_id=entity_id,
                operation='DELETE'
            ).exists()
            
            if has_pending_delete:
                entity_type = change_type.lower().replace('_', ' ')
                raise ValidationError({
                    'non_field_errors': [
                        f'Cannot submit change request. This {entity_type} already has a pending delete request. Please wait for admin approval or rejection.'
                    ]
                })
        
        # For CREATE operations on COMPENSATION, check if same personnel and type already has pending CREATE
        if operation == 'CREATE' and change_type == 'COMPENSATION' and proposed_changes:
            personnel_id = proposed_changes.get('personnel')
            comp_type = proposed_changes.get('type')
            
            if personnel_id and comp_type:
                # Check each pending CREATE request for COMPENSATION
                for pending_req in pending_requests.filter(operation='CREATE'):
                    if pending_req.proposed_changes:
                        pending_personnel = pending_req.proposed_changes.get('personnel')
                        pending_type = pending_req.proposed_changes.get('type')
                        
                        if pending_personnel == personnel_id and pending_type == comp_type:
                            type_label = 'Salary' if comp_type == 'SALARY' else 'Honoraria'
                            raise ValidationError({
                                'non_field_errors': [
                                    f'Cannot submit change request. There is already a pending {type_label} compensation request for this personnel. Please wait for admin approval or rejection before submitting another request.'
                                ]
                            })
        
        # For UPDATE operations, check for field-level conflicts
        if operation == 'UPDATE' and entity_id and current_state and proposed_changes:
            fields_being_changed = get_changed_fields(current_state, proposed_changes)
            field_labels = field_labels_map.get(change_type, {})
            
            # Check each pending request for the same entity
            for pending_req in pending_requests.filter(entity_id=entity_id, operation='UPDATE'):
                if pending_req.current_state and pending_req.proposed_changes:
                    pending_changed_fields = get_changed_fields(
                        pending_req.current_state,
                        pending_req.proposed_changes
                    )
                    
                    # Find conflicting fields
                    conflicting_fields = fields_being_changed.intersection(pending_changed_fields)
                    
                    if conflicting_fields:
                        field_names = ', '.join([
                            field_labels.get(field, field) 
                            for field in conflicting_fields
                        ])
                        raise ValidationError({
                            'non_field_errors': [
                                f'Cannot submit change request. The following field(s) are already pending in a change request: {field_names}. Please wait for admin approval or rejection before submitting changes to these fields.'
                            ]
                        })
        
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
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None, project_pk=None):
        """
        Cancel a change request. Only Project Staff can cancel their own pending requests.
        """
        change_request = self.get_object()
        user = request.user
        
        # Only Project Staff can cancel
        if user.role != "PROJECT_STAFF":
            return Response(
                {'error': 'Only Project Staff can cancel change requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only the submitter can cancel their own request
        if change_request.submitted_by != user:
            return Response(
                {'error': 'You can only cancel your own change requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate status
        if change_request.status != 'PENDING':
            return Response(
                {'error': f'Cannot cancel change request with status {change_request.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get cancel reason from request
        cancel_reason = request.data.get('cancel_reason', '')
        
        # Use select_for_update to prevent concurrent cancellations
        with transaction.atomic():
            change_request = ChangeRequest.objects.select_for_update().get(pk=change_request.pk)
            
            # Double-check status after locking
            if change_request.status != 'PENDING':
                return Response(
                    {'error': f'Change request status changed to {change_request.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update change request status
            change_request.status = 'CANCELED'
            change_request.date_processed = timezone.now()
            change_request.cancel_reason = cancel_reason
            change_request.save()
            
            serializer = self.get_serializer(change_request)
            return Response(serializer.data, status=status.HTTP_200_OK)