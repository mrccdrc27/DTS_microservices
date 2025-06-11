# workflow_api/tickets/tasks.py

from celery import shared_task
from tickets.models import WorkflowTicket
from datetime import datetime
from django.utils.timezone import make_aware

@shared_task(name='tickets.tasks.receive_ticket')  # 👈 match this name!
def receive_ticket(ticket_data):
    try:
        if isinstance(ticket_data.get('opened_on'), str):
            ticket_data['opened_on'] = datetime.fromisoformat(ticket_data['opened_on']).date()

        if isinstance(ticket_data.get('fetched_at'), str):
            dt = datetime.fromisoformat(ticket_data['fetched_at'])
            ticket_data['fetched_at'] = make_aware(dt) if dt.tzinfo is None else dt

        WorkflowTicket.objects.create(**ticket_data)
        return {"status": "success", "ticket_id": ticket_data.get("ticket_id")}
    
    except Exception as e:
        return {"status": "error", "error": str(e)}
