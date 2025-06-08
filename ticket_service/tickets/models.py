# ticket_service/models.py
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class Ticket(models.Model):
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

    ticket_id = models.CharField(max_length=20, unique=True)
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
    
    # Track workflow push status
    pushed_to_workflow = models.BooleanField(default=False)
    workflow_push_at = models.DateTimeField(null=True, blank=True)
    workflow_ticket_id = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.ticket_id} - {self.subject}"

class TicketPushQueue(models.Model):
    """Queue for tickets waiting to be pushed to workflow service"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'), 
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    retry_ = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    last_error = models.TextField(blank=True, null=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)  # For delayed retries
    
    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['scheduled_for']),
        ]
    
    def __str__(self):
        return f"Queue {self.id}: {self.ticket.ticket_id} - {self.status}"

# from services import WorkflowPushService

@receiver(post_save, sender=Ticket)
def auto_push_ticket(sender, instance, created, **kwargs):
    """Automatically push new tickets to workflow service"""
    if created and not instance.pushed_to_workflow:
        from .services import WorkflowPushService
        
        workflow_service = WorkflowPushService()
        
        # Try immediate push first
        result = workflow_service.push_ticket_to_workflow(instance.id)
        
        if not result['success']:
            # If immediate push fails, add to queue for retry
            TicketPushQueue.objects.get_or_create(
                ticket=instance,
                defaults={
                    'status': 'pending',
                    'last_error': result.get('error', 'Initial push failed')
                }
            )
            print(f"Added ticket {instance.ticket_id} to push queue after failed immediate push")
        else:
            print(f"Successfully pushed ticket {instance.ticket_id} immediately")