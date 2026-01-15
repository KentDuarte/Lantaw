from rest_framework import serializers
from  .models import BudgetLineItem, Compensation

class BudgetLineItemSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = BudgetLineItem
        fields = [
            "id",
            "name",
            "project",
            "project_name",
            "date_created",
            "date_modified",
        ]
        read_only_fields = ("project", "date_created", "date_modified")

class CompensationSerializer(serializers.ModelSerializer):
    budget_item_name = serializers.CharField(source="budgetItem.name", read_only=True)
    personnel_first_name = serializers.CharField(source="personnel.first_name", read_only=True)
    personnel_last_name = serializers.CharField(source="personnel.last_name", read_only=True)

    class Meta:
        model = Compensation
        fields = [
            "id",
            "type",
            "budget_item",
            "budget_item_name",
            "personnel",
            "personnel_first_name",
            "personnel_last_name",
            "reason",
            "amount",
            "date_effective",
            "date_modified",
        ]
        read_only_fields = ("date_modified", "budget_item_name", "personnel_first_name", "personnel_last_name")
        extra_kwargs = {
            'budget_item': {'required': False}  # 🔹 make optional for POST
        }

    def create(self, validated_data):
        # 🔹 Automatically assign PS budget item if missing
        if 'budget_item' not in validated_data:
            ps_item = BudgetLineItem.objects.filter(name='PS', project_id=self.context['view'].kwargs['project_pk']).first()
            if not ps_item:
                raise serializers.ValidationError("No PS budget item found for this project.")
            validated_data['budget_item'] = ps_item
        return super().create(validated_data)