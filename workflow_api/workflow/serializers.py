from rest_framework import serializers
from django.db import transaction
from .models import *
from step.models import Steps, StepActions
from role.models import Positions

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name']

class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflows
        fields = (
            "id", "status", "userID", "workflowName",
            "description", "mainCategory", "subCategory"
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        steps = Steps.objects.filter(workflow=instance)

        # Status override logic
        if steps.exists():
            all_initialized = all(
                StepActions.objects.filter(step=step).exists() for step in steps
            )
            if all_initialized:
                data["status"] = "initialized"

        return data

class WorkflowSerializer2(serializers.ModelSerializer):

    # Define the main and subcategory fields with appropriate queryset filters
    mainCategory = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.filter(parent__isnull=True)
    )
    subCategory = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.filter(parent__isnull=False)
    )
    class Meta:
        model = Workflows
        fields = (
            "id", "userID", "workflowName",
            "description", "mainCategory", "subCategory"
        )

        read_only_fields = ("status",)  # Make status read-only

    def to_representation(self, instance):
        data = super().to_representation(instance)
        steps = Steps.objects.filter(workflow=instance)

        data["status"] = instance.status

        # Override status if all steps have actions
        if steps.exists():
            all_initialized = all(
                StepActions.objects.filter(step=step).exists() for step in steps
            )
            if all_initialized:
                data["status"] = "initialized"
            else:
                data["status"] = "draft"

        return data

    def create(self, validated_data):
        position = Positions.objects.first()
        with transaction.atomic():
            # Step 1: Create the workflow
            workflow = Workflows.objects.create(**validated_data)

            # # Step 2: Create initial Step (e.g., Step 1)
            # initial_step = Steps.objects.create(
            #     workflow=workflow,
            #     stepName="Step 1",
            #     description="Initial step",
            #     order=1,
            #     position=position  # or set this if required
            # )

            # # Step 3: Create a StepTransition where from_step is None
            # StepTransition.objects.create(
            #     from_step=None,
            #     to_step=initial_step,
            #     condition="initial"  # or your default condition
            # )

            return workflow