from rest_framework import viewsets, permissions, generics, status, filters
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, PasswordChangeSerializer
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

class IsAdminOrSelf(permissions.BasePermission):
    """
    Custom permission:
    - Admin can do anything.
    - Normal users can only view/update their own profile.
    """
    def has_permission(self, request, view):
        # Add list-level permission check
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True
        # Only allow safe methods (GET, HEAD, OPTIONS) or updates for own profile
        if request.method in permissions.SAFE_METHODS:
            return obj == request.user
        # Restrict DELETE for non-admins
        if request.method == 'DELETE':
            return False
        return obj == request.user

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]
    filter_backends = [filters.SearchFilter]
    search_fields = ['email'] 

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all().order_by("-date_joined")

        # If not admin, only see personal data
        if user.role != "ADMIN":
            queryset = queryset.filter(id=user.id)

        return queryset

    def perform_update(self, serializer):
        user = self.request.user

        # Make sure non-admins can't update roles or other restricted fields
        if user.role != "ADMIN":
            protected_fields = ['role', 'is_staff', 'is_superuser', 'is_active', 'date_joined']
            for field in protected_fields:
                serializer.validated_data.pop(field, None)

        serializer.save()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny] 
    queryset = User.objects.all()

class PasswordChangeView(generics.UpdateAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['put', 'patch']

    def get_object(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            raise PermissionDenied("Authentication required")
        return user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)