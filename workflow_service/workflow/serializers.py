from .models import *
from rest_framework import serializers
from django.contrib.auth import authenticate


#displays all
# should displays all the step associated with that workflow
class WorkflowSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = Steps
        fields = (
            "id",
            "workflow",
            "position",
            "stepName",
            "description",
            )

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
        fields = (
            "id",
            "step",
            "action"
        )

    def create(self, validated_data):
        return StepActions.objects.create(**validated_data)


# create workflow changestatus: