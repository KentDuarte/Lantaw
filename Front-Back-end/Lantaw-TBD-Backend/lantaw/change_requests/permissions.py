from rest_framework import permissions
from projects.models import ProjectMembers


class IsAdminOnly(permissions.BasePermission):
    """
    Only ADMIN users can approve/reject change requests.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"
    
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsProjectStaffOrAdmin(permissions.BasePermission):
    """
    Project Staff can create change requests, Admin can view all.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admin can do everything
        if request.user.role == "ADMIN":
            return True
        
        # Project Staff can create change requests
        if request.user.role == "PROJECT_STAFF":
            return request.method in ['POST', 'GET', 'HEAD', 'OPTIONS']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin can view all
        if user.role == "ADMIN":
            return True
        
        # Project Staff can only view their own submitted requests
        if user.role == "PROJECT_STAFF":
            return obj.submitted_by == user
        
        return False


class CanSubmitChangeRequest(permissions.BasePermission):
    """
    Validates that Project Staff is assigned to the project before allowing submission.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admin can always submit
        if request.user.role == "ADMIN":
            return True
        
        # For Project Staff, check if they're assigned to the project
        if request.user.role == "PROJECT_STAFF" and request.method == 'POST':
            project_id = request.data.get('project') or view.kwargs.get('project_pk')
            if project_id:
                return ProjectMembers.objects.filter(
                    project_id=project_id,
                    user=request.user
                ).exists()
        
        return False

