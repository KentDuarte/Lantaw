from rest_framework import serializers
from .models import Personnel, Role, Department


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model=Role
        fields=["id", "name"]

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Department
        fields=["id", "name"]

class PersonnelSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Personnel
        fields = [
            "id",
            "first_name",
            "last_name",
            "role",
            "role_name",
            "department",
            "department_name",
            "employment_status",
        ]