from .models import *
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import transaction



#displays all
# should displays all the step associated with that workflow
from rest_framework import serializers
from .models import Workflows, Steps, StepActions

class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflows
        fields = (
            "status",
            "userID",
            "workflowName",
            "description",
            "mainCategory",
            "subCategory",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Get all steps related to the workflow
        steps = Steps.objects.filter(workflow=instance)

        # Consider a step initialized if it has at least one StepAction
        if steps.exists():
            all_steps_initialized = all(
                StepActions.objects.filter(step=step).exists() for step in steps
            )
            if all_steps_initialized:
                data["status"] = "initialized"

        return data

        
class WorkflowRegister(serializers.ModelSerializer):
    class Meta:
        model = Workflows
        fields = (
            "id",
            "userID",
            "workflowName",
            "description",
            "mainCategory",
            "subCategory",
            )
    
    def create(self, validated_data):
        return Workflows.objects.create(**validated_data)
   

class StepRegister(serializers.ModelSerializer):

    workflowName = serializers.SerializerMethodField()
    workflow = serializers.PrimaryKeyRelatedField(
        queryset=Workflows.objects.all(), write_only=True
    )
    positionName = serializers.SerializerMethodField()
    position = serializers.PrimaryKeyRelatedField(
        queryset=Positions.objects.all(), write_only=True
    )

    class Meta:
        model = Steps
        fields = (
            "id",
            "workflow",
            "workflowName",
            "position",
            "positionName",
            "stepName",
            "description",
        )

    def get_workflowName(self, obj):
        return obj.workflow.workflowName if obj.workflow else None
    def get_positionName(self, obj):
        return obj.position.positionName if obj.position else None

    def create(self, validated_data):
        return Steps.objects.create(**validated_data)

    
class StepSerializer(serializers.ModelSerializer):
    isInitialized = serializers.SerializerMethodField()

    class Meta:
        model = Steps
        fields = (
            "id",
            "isInitialized",
            "workflow",
            "position",
            "stepName",
            "description",
        )

    def get_isInitialized(self, obj):
        # Check if there are any StepAction records associated with this step
        return StepActions.objects.filter(step=obj).exists()

class StepActionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepActions
        fields = (
            "id",
            "step",
            "action"
        )

class StepActionRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepActions
        fields = ("id", "step", "action")

    def create(self, validated_data):
        with transaction.atomic():
            step_action = StepActions.objects.create(**validated_data)

            # Step gets initialized if it wasn't already
            step = step_action.step
            if not step.isInitialized:
                step.isInitialized = True
                step.save()

            # Check if all steps of the workflow are initialized
            workflow = step.workflow
            all_steps_initialized = not Steps.objects.filter(workflow=workflow, isInitialized=False).exists()
            if all_steps_initialized:
                workflow.isInitialized = True
                workflow.status = "initialized"
                workflow.save()

            return step_action


# create workflow changestatus: