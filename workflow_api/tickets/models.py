from django.db import models

class WorkflowTicket(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
        ('On Hold', 'On Hold'),
    ]

    # Original ticket fields
    ticket_id = models.CharField(max_length=20)  # Not unique since it's a copy
    subject = models.CharField(max_length=255)
    customer = models.CharField(max_length=100)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Low')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    opened_on = models.DateField()
    sla = models.CharField(max_length=20)
    description = models.TextField()
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    fetched_at = models.DateTimeField(null=True, blank=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    
    # Workflow service specific fields
    original_ticket_id = models.CharField(max_length=20)  # Reference to original ticket
    source_service = models.CharField(max_length=50, default='ticket_service')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['original_ticket_id']),
            models.Index(fields=['source_service']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['customer']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return f"WF-{self.id} ({self.original_ticket_id}) - {self.subject}"