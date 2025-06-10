from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'ticket_id', 'workflow_id', 'fetched_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['ticket_id'] = instance.ticket_id.ticket_id if instance.ticket_id else None
        data['workflow_id'] = instance.workflow_id.id if instance.workflow_id else None
        return data