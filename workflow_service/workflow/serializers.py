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


class StepSerializer(serializers.ModelSerializer):
    workflowName = serializers.SerializerMethodField()
    positionName = serializers.SerializerMethodField()
    isInitialized = serializers.SerializerMethodField()

    class Meta:
        model = Steps
        fields = (
            "id", "workflow", "workflowName", "position", "positionName",
            "stepName", "description", "isInitialized"
        )

    def get_workflowName(self, obj):
        return obj.workflow.workflowName if obj.workflow else None

    def get_positionName(self, obj):
        return obj.position.positionName if obj.position else None

    def get_isInitialized(self, obj):
        return StepActions.objects.filter(step=obj).exists()


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
