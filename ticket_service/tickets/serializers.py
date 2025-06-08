from rest_framework import serializers
from .models import Ticket, TicketPushQueue

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class TicketPushSerializer(serializers.ModelSerializer):
    """Serializer for pushing ticket data to workflow service"""
    class Meta:
        model = Ticket
        exclude = ['id', 'pushed_to_workflow', 'workflow_push_at', 'workflow_ticket_id']

class TicketPushQueueSerializer(serializers.ModelSerializer):
    ticket_id = serializers.CharField(source='ticket.ticket_id', read_only=True)
    ticket_subject = serializers.CharField(source='ticket.subject', read_only=True)
    
    class Meta:
        model = TicketPushQueue
        fields = '__all__'