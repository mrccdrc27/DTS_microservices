from rest_framework import serializers
from django.db import transaction
from .models import *
from step.models import Steps, StepTransition
from role.models import Roles

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name']

class WorkflowSerializer(serializers.ModelSerializer):

    # Define the main and subcategory fields with appropriate queryset filters
    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.filter(parent__isnull=True)
    )
    sub_category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.filter(parent__isnull=False)
    )
    class Meta:
        model = Workflows
        fields = (
            "id",
            "user_id", 
            "name",
            "description", 
            "category", 
            "sub_category",
            "workflow_id"
        )



        read_only_fields = ("status",
                            "workflow_id", )  # Make status read-only

    def to_representation(self, instance):
        data = super().to_representation(instance)
        steps = Steps.objects.filter(workflow_id=instance)

        data["status"] = instance.status

        # Override status if all steps have actions
        if steps.exists():
            all_initialized = all(
                StepTransition.objects.filter(
                    models.Q(from_step_id=step) | models.Q(to_step_id=step)
                ).exists()
                for step in steps
            )
            if all_initialized:
                data["status"] = "initialized"
            else:
                data["status"] = "draft"

        return data

    def create(self, validated_data):
        position = Roles.objects.first()
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
        
# This code is a Django REST Framework serializer for a workflow management system.
from rest_framework import serializers
from .models import Workflows, Category
from step.models import Steps, StepTransition
from action.models import Actions
from role.models import Roles


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent']


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = ['id', 'name', 'description']


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Steps
        fields = [
            'id', 'name', 'description', 'order',
            'is_initialized', 'created_at', 'updated_at', 'role_id'
        ]


class StepTransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepTransition
        fields = ['id', 'from_step_id', 'to_step_id', 'action_id']


class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actions
        fields = ['id', 'name', 'description']


class WorkflowAggregatedSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    sub_category = CategorySerializer(read_only=True)

    class Meta:
        model = Workflows
        fields = [
            'id', 'workflow_id', 'user_id', 'name', 'description',
            'status', 'createdAt', 'updatedAt',
            'category', 'sub_category'
        ]


class FullWorkflowSerializer(serializers.Serializer):
    workflow = serializers.SerializerMethodField()

    def get_workflow(self, obj: Workflows):
        steps = Steps.objects.filter(workflow_id=obj)
        step_ids = steps.values_list('id', flat=True)

        transitions = StepTransition.objects.filter(from_step_id__in=step_ids)
        action_ids = transitions.values_list('action_id', flat=True)
        role_ids = steps.values_list('role_id', flat=True).distinct()

        return {
            **WorkflowAggregatedSerializer(obj).data,
            "role": RoleSerializer(Roles.objects.filter(id__in=role_ids).first()).data if role_ids else None,
            "steps": StepSerializer(steps, many=True).data,
            "transitions": StepTransitionSerializer(transitions, many=True).data,
            "actions": ActionSerializer(Actions.objects.filter(id__in=action_ids), many=True).data,
        }
