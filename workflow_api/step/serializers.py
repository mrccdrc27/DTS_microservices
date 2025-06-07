from rest_framework import serializers
from django.db import transaction
from .models import Steps, StepActions

from rest_framework import serializers
from django.db import transaction
from .models import Steps, StepTransition, Positions 

from rest_framework import serializers
from action.serializers import ActionSerializer
from action.models import Actions

class StepSerializer(serializers.ModelSerializer):

    position = serializers.SlugRelatedField(
        slug_field='positionName',
        queryset=Positions.objects.all()
    )

    # workflowName = serializers.SerializerMethodField()
    # positionName = serializers.SerializerMethodField()
    isInitialized = serializers.SerializerMethodField()
    # nextSteps = serializers.SerializerMethodField()

    class Meta:
        model = Steps
        fields = (
            "id", 
            "workflow",
            # "workflowName",
            "position", 
            # "positionName",
            "stepName", 
            "description",
            "order",
            "isInitialized",
            # "nextSteps",
            "createdAt", 
            "updatedAt"
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

class StepTransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepTransition
        fields = [
            'id',
            'from_step',
            'to_step',
            'action',
        ]
        read_only_fields = ['id']

        # validation: from_step != to_step
        # from_step workflow must be equal to to_step workflow

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actions
        fields = ['id', 'actionName', 'description']
        read_only_fields = ['id']


class StepTransitionSerializer(serializers.ModelSerializer):
    action = ActionSerializer()

    class Meta:
        model = StepTransition
        fields = ['id', 'from_step', 'to_step', 'action']
        read_only_fields = ['id']

    def validate(self, attrs):
        frm = attrs.get('from_step') or getattr(self.instance, 'from_step', None)
        to  = attrs.get('to_step')   or getattr(self.instance, 'to_step', None)

        # 1) from_step != to_step
        if frm and to and frm.pk == to.pk:
            raise serializers.ValidationError("from_step and to_step must be different")

        # 2) Same workflow
        if frm and to and frm.workflow_id != to.workflow_id:
            raise serializers.ValidationError("from_step and to_step must be in the same workflow")

        return attrs

    def create(self, validated_data):
        action_data = validated_data.pop('action')
        action, _ = Actions.objects.get_or_create(
            actionName=action_data['actionName'],
            defaults={'description': action_data.get('description')}
        )
        return StepTransition.objects.create(action=action, **validated_data)

    def update(self, instance, validated_data):
        # 1) Handle nested action
        action_data = validated_data.pop('action', None)
        if action_data:
            action, _ = Actions.objects.get_or_create(
                actionName=action_data['actionName'],
                defaults={'description': action_data.get('description')}
            )
            instance.action = action

        # 2) Update FK fields if provided
        instance.from_step = validated_data.get('from_step', instance.from_step)
        instance.to_step   = validated_data.get('to_step',   instance.to_step)

        # 3) Run full_clean to trigger any model-level clean() if you have one
        instance.full_clean()

        # 4) Save and return
        instance.save()
        return instance