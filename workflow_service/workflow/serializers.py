from rest_framework import serializers
from django.db import transaction
from .models import Workflows, Steps, StepActions


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

from rest_framework import serializers
from django.db import transaction
from .models import Workflows, Steps, StepTransition, Positions 

from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name']


class WorkflowSerializer2(serializers.ModelSerializer):
    class Meta:
        model = Workflows
        fields = (
            "id", "status", "userID", "workflowName",
            "description", "mainCategory", "subCategory"
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        steps = Steps.objects.filter(workflow=instance)

        # Override status if all steps have actions
        if steps.exists():
            all_initialized = all(
                StepActions.objects.filter(step=step).exists() for step in steps
            )
            if all_initialized:
                data["status"] = "initialized"

        return data

    def create(self, validated_data):
        position = Positions.objects.first()
        with transaction.atomic():
            # Step 1: Create the workflow
            workflow = Workflows.objects.create(**validated_data)

            # Step 2: Create initial Step (e.g., Step 1)
            initial_step = Steps.objects.create(
                workflow=workflow,
                stepName="Step 1",
                description="Initial step",
                order=1,
                position=position  # or set this if required
            )

            # Step 3: Create a StepTransition where from_step is None
            StepTransition.objects.create(
                from_step=None,
                to_step=initial_step,
                condition="initial"  # or your default condition
            )

            return workflow

    
from .models import Steps, StepTransition, StepActions  # Adjust import based on your app structure

class StepSerializer(serializers.ModelSerializer):
    # workflowName = serializers.SerializerMethodField()
    # positionName = serializers.SerializerMethodField()
    isInitialized = serializers.SerializerMethodField()
    # nextSteps = serializers.SerializerMethodField()

    class Meta:
        model = Steps
        fields = (
            "id", "workflow",
            # "workflowName",
            "position", 
            # "positionName",
            "stepName", "description",
            "order",
            "isInitialized",
            # "nextSteps",
            "createdAt", "updatedAt"
        )

    # def get_workflowName(self, obj):
    #     return getattr(obj.workflow, 'workflowName', None)

    # def get_positionName(self, obj):
    #     return getattr(obj.position, 'positionName', None)

    def get_isInitialized(self, obj):
        # Ensure StepActions is imported or replace with your own logic
        return StepActions.objects.filter(step=obj).exists()

    # def get_nextSteps(self, obj):
    #     transitions = StepTransition.objects.filter(from_step=obj).select_related('to_step')
    #     return [
    #         {
    #             "id": t.to_step.id,
    #             "stepName": t.to_step.stepName,
    #             "condition": t.condition
    #         }
    #         for t in transitions
    #     ]
    

class StepSerializer2(serializers.ModelSerializer):
    class Meta:
        model = Steps
        fields = [
            'id',
            'workflow',
            'position',
            'stepName',
            'description',
            'isInitialized',
            'order',
            'createdAt',
            'updatedAt',
        ]
        read_only_fields = ['id', 'createdAt', 'updatedAt']


class StepTransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepTransition
        fields = [
            'id',
            'from_step',
            'to_step',
            'condition',
        ]
        read_only_fields = ['id']

class StepActionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepActions
        fields = ("id", "step", "action")

    def create(self, validated_data):
        with transaction.atomic():
            step_action = StepActions.objects.create(**validated_data)

            # Custom logic: Update statuses
            step = step_action.step
            workflow = step.workflow

            all_steps_initialized = all(
                StepActions.objects.filter(step=s).exists()
                for s in Steps.objects.filter(workflow=workflow)
            )
            if all_steps_initialized:
                workflow.status = "initialized"
                workflow.save()

            return step_action
