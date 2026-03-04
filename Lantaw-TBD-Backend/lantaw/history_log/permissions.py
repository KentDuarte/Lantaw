from rest_framework import permissions


class IsAdminExecutiveOrProjectStaff(permissions.BasePermission):
    """
    All authenticated users (Admin, Executive, Project Staff) can view history log.
    Only Admin can revert.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can view
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only Admin can revert
        if view.action == 'revert':
            return request.user.role == "ADMIN"
        
        return False
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can view
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only Admin can revert
        if view.action == 'revert':
            return request.user.role == "ADMIN"
        
        return False

