from celery import shared_task
# import requests
# import json

@shared_task(name='tickets.tasks.notify_ticket_created')
def notify_ticket_created(ticket_id):
    """Local task - runs in ticket service"""
    print(f"[TICKET SERVICE] Ticket created: {ticket_id}")
    return f"Notification sent for ticket {ticket_id}"

@shared_task(name='tickets.tasks.send_to_workflow')
def send_to_workflow(ticket_data):
    """Send ticket to workflow service - this runs in TICKET service"""
    try:
        # Use Celery to send task to workflow service
        from celery import Celery
        
        # Create connection to workflow service
        workflow_celery = Celery('workflow_api')
        workflow_celery.config_from_object({
            'broker_url': 'amqp://guest:guest@localhost:5672//',
            'result_backend': 'rpc://',
            'task_serializer': 'json',
            'accept_content': ['json'],
            'result_serializer': 'json',
        })
        
        # Send task to workflow service
        result = workflow_celery.send_task(
            'workflows.tasks.handle_ticket',  # This task exists in workflow service
            args=[ticket_data]
        )
        
        print(f"[TICKET SERVICE] Sent to workflow: {ticket_data['ticket_id']}")
        return f"Sent ticket {ticket_data['ticket_id']} to workflow"
        
    except Exception as e:
        print(f"[TICKET SERVICE] Error sending to workflow: {e}")
        return f"Error: {e}"