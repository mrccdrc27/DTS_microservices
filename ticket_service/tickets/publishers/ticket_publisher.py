from ticket_service.ticket_service.celery import app as celery_app

def publish_ticket(ticket):
    ticket_data = {
        'ticket_id': ticket.id,
        'subject': ticket.subject,
        'priority': ticket.priority,
        'Opened on': ticket.opened_on,
    }
    # send task to workflow_service's worker
    celery_app.send_task('workflows.tasks.handle_ticket', args=[ticket_data])
