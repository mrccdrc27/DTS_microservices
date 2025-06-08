from rest_framework import serializers
from .models import WorkflowTicket

class WorkflowTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowTicket
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class WorkflowTicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating workflow tickets from ticket service"""
    class Meta:
        model = WorkflowTicket
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']