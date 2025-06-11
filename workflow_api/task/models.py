from django.db import models
from django.core.exceptions import ValidationError
import uuid

class Task(models.Model):
    task_id = models.CharField(max_length=64, unique=True, null=True, blank=True)  # New UUID field

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
        from tickets.models import WorkflowTicket
        return WorkflowTicket.objects.first()

    fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Task {self.id} for Ticket ID: {self.ticket_id}'
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only enforce immutability on creation
            if not self.task_id:
                self.task_id = str(uuid.uuid4())  # Assign a unique identifier if missing
        else:
            if 'task_id' in kwargs.get('update_fields', []):
                raise ValidationError("task_id cannot be modified after creation.")  # Prevent updates
        
        super().save(*args, **kwargs)
