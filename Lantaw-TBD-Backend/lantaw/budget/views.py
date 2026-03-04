from rest_framework import viewsets, permissions
from .models import BudgetLineItem, Compensation
from .serializers import BudgetLineItemSerializer, CompensationSerializer
from rest_framework.exceptions import PermissionDenied


class IsAdminExecutiveOrProjectStaff(permissions.BasePermission):
    """
    Admin: Full access
    Executive: Read-only
    Project Staff: Only budget items in their projects
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user = request.user

        if user.role == "ADMIN":
            return True
        # Project Staff: Read-only access (must use Change Requests for edits)
        if user.role == "PROJECT_STAFF":
            return request.method in permissions.SAFE_METHODS
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        project_id = view.kwargs.get('project_pk') 

        if user.role == "ADMIN":
            return True
        if user.role == "EXECUTIVE":
            return request.method in permissions.SAFE_METHODS
        # Project Staff: only allowed to see objects in their projects
        if user.role == "PROJECT_STAFF":
            if isinstance(obj, BudgetLineItem):
                return BudgetLineItem.objects.filter(project_id=project_id, project__projectmembers__user=user.id).exists()
            if isinstance(obj, Compensation):
                return Compensation.objects.filter(budget_item__project_id=project_id, budget_item__project__projectmembers__user=user.id).exists()
        return False
    
class BudgetLineItemViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetLineItemSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def perform_create(self, serializer):
        user = self.request.user
        project_id = self.kwargs.get("project_pk")

        if not BudgetLineItem.objects.filter(project_id=project_id, project__projectmembers__user=user.id).exists() \
              and user.role not in ["ADMIN", "EXECUTIVE"]:
                raise PermissionDenied("You are not allowed to create for this project.")
        
        serializer.save(project_id=project_id)

    def get_queryset(self):
        user = self.request.user
        project_pk = self.kwargs.get("project_pk")

        # Get the budget line items related to the project 
        qs = BudgetLineItem.objects.filter(project_id=project_pk) 

        if user.role in ["ADMIN", "EXECUTIVE"]:
            return qs
        # Return only when the user is confirmed to be part of the project
        elif user.role == "PROJECT_STAFF":
            return qs.filter(project__projectmembers__user=user.id)
        return BudgetLineItem.objects.none()

class CompensationViewSet(viewsets.ModelViewSet):
    serializer_class = CompensationSerializer
    permission_classes = [IsAdminExecutiveOrProjectStaff]

    def get_serializer_context(self):
        """Add project_pk to serializer context."""
        context = super().get_serializer_context()
        context['project_pk'] = self.kwargs.get('project_pk')
        return context

    def perform_create(self, serializer):
        user = self.request.user
        project_id = self.kwargs.get("project_pk")

        if not Compensation.objects.filter(budget_item__project_id=project_id, budget_item__project__projectmembers__user=user.id).exists() \
              and user.role not in ["ADMIN", "EXECUTIVE"]:
                raise PermissionDenied("You are not allowed to create for this project.")
        
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        project_pk = self.kwargs.get("project_pk")

        # Get the compensations related to the project's budget line items
        qs = Compensation.objects.filter(budget_item__project_id=project_pk) 

        if user.role in ["ADMIN", "EXECUTIVE"]:
            return qs
        # Return only when the user is confirmed to be part of the project
        elif user.role == "PROJECT_STAFF":
            return qs.filter(budget_item__project__projectmembers__user=user.id)
        return Compensation.objects.none()
