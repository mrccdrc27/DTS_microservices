from celery import shared_task
from tickets.models import WorkflowTicket
from datetime import datetime

@shared_task(name='workflow.receive_ticket')
def receive_ticket(ticket_data):
    try:
        ticket_data['opened_on'] = datetime.fromisoformat(ticket_data['opened_on']).date()

        if ticket_data.get('fetched_at'):
            ticket_data['fetched_at'] = datetime.fromisoformat(ticket_data['fetched_at'])

        WorkflowTicket.objects.create(**ticket_data)
        return {"status": "saved", "ticket_id": ticket_data["ticket_id"]}

    except Exception as e:
        return {"status": "error", "message": str(e)}
