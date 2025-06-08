from django.db import models

class Task(models.Model):
    ticket_id = models.ForeignKey(
        'tickets.WorkflowTicket',  # Assuming Ticket model is in tickets app
        on_delete=models.CASCADE,
    )
    workflow_id = models.ForeignKey('workflow.Workflows', on_delete=models.CASCADE)

    def get_workflow(self):
        # Optional: only if you need to reference it somewhere dynamically
        from workflow.models import Workflows
        return Workflows.objects.first()
    
    
    def get_ticket(self):
        # Optional: only if you need to reference it somewhere dynamically
        from tickets.models import Ticket
        return Ticket.objects.first()

    fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Task {self.id} for Ticket ID: {self.ticket_id}'
