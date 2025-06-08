from celery import shared_task

@shared_task(bind=True, name='workflows.tasks.handle_ticket')
def handle_ticket(self, ticket_data):
    """Process ticket in workflow API"""
    print(f"[WORKFLOW API] Processing ticket: {ticket_data}")
    
    try:
        # Your workflow logic here
        ticket_id = ticket_data.get('ticket_id', 'unknown')
        priority = ticket_data.get('priority', 'Low')
        
        if priority == 'Critical':
            print(f"[WORKFLOW API] URGENT: Escalating ticket {ticket_id}")
        else:
            print(f"[WORKFLOW API] Standard processing for ticket {ticket_id}")
        
        return f"Workflow completed for ticket {ticket_id}"
    except Exception as e:
        print(f"[WORKFLOW API] Error processing ticket: {e}")
        raise self.retry(exc=e, countdown=60, max_retries=3)