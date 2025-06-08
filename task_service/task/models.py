from django.db import models

class Task(models.Model):
    ticket_id = models.PositiveIntegerField()  # External Ticket (no FK constraint)
    workflow_id = models.PositiveIntegerField()  # External Workflow (no FK constraint)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'Task {self.id} for Ticket ID: {self.ticket_id}'
