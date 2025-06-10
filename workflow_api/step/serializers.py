from rest_framework import serializers
from .models import Steps, StepTransition
from role.models import Roles
from action.models import Actions


class StepSerializer(serializers.ModelSerializer):

    role_id = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Roles.objects.all()
    )
    is_initialized = serializers.SerializerMethodField()
    class Meta:
        model = Steps
        fields = (
            "id", 
            "step_id",
            "workflow_id",
            "role_id", 
            "name", 
            "description",
            "order",
            "is_initialized",
            "created_at", 
            "updated_at"
        )
    def get_is_initialized(self, obj):
        return StepTransition.objects.filter(to_step_id=obj).exists()

# class StepTransitionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StepTransition
#         fields = [
#             'id',
#             'from_step',
#             'to_step',
#             'action_id',
#         ]
#         read_only_fields = ['id']

#         # validation: from_step != to_step
#         # from_step workflow must be equal to to_step workflow

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actions
        fields = ['id', 'actionName', 'description']
        read_only_fields = ['id']



class StepTransitionSerializer(serializers.ModelSerializer):
    action_id = serializers.PrimaryKeyRelatedField(queryset=Actions.objects.all())
    from_step_id = serializers.PrimaryKeyRelatedField(queryset=Steps.objects.all())
    to_step_id = serializers.PrimaryKeyRelatedField(queryset=Steps.objects.all())

    class Meta:
        model = StepTransition
        fields = ['id', 'from_step_id', 'to_step_id', 'action_id']
        read_only_fields = ['id']

    def validate(self, attrs):
        frm = attrs.get('from_step_id') or getattr(self.instance, 'from_step_id', None)
        to  = attrs.get('to_step_id')   or getattr(self.instance, 'to_step_id', None)

        # No self-loop
        if frm and to and frm.pk == to.pk:
            raise serializers.ValidationError("from_step and to_step must be different")

        # Same workflow constraint
        if frm and to and frm.workflow_id != to.workflow_id:
            raise serializers.ValidationError("from_step and to_step must belong to the same workflow")

        return attrs

    def create(self, validated_data):
        action_data = validated_data.pop('action_id')
        action, _ = Actions.objects.get_or_create(
            actionName=action_data.actionName,
            defaults={'description': getattr(action_data, 'description', None)}
        )
        return StepTransition.objects.create(action_id=action, **validated_data)

    def update(self, instance, validated_data):
        action_data = validated_data.pop('action_id', None)
        if action_data:
            action, _ = Actions.objects.get_or_create(
                actionName=action_data.actionName,
                defaults={'description': getattr(action_data, 'description', None)}
            )
            instance.action_id = action

        instance.from_step_id = validated_data.get('from_step_id', instance.from_step_id)
        instance.to_step_id   = validated_data.get('to_step_id',   instance.to_step_id)

        instance.full_clean()
        instance.save()
        return instance