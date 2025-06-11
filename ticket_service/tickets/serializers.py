from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class TicketPushSerializer(serializers.ModelSerializer):
    """Serializer for pushing ticket data to workflow service"""
    class Meta:
        model = Ticket
        exclude = ['id', 'pushed_to_workflow', 'workflow_push_at', 'workflow_ticket_id']


def ticket_to_dict(ticket):
    return {
        "ticket_id": ticket.ticket_id,
        "subject": ticket.subject,
        "customer": ticket.customer,
        "priority": ticket.priority,
        "status": ticket.status,
        "opened_on": str(ticket.opened_on),
        "sla": ticket.sla,
        "description": ticket.description,
        "department": ticket.department,
        "position": ticket.position,
        "fetched_at": ticket.fetched_at.isoformat() if ticket.fetched_at else None,
        "category": ticket.category,
        "subcategory": ticket.subcategory
    }
