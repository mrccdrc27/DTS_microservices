from django.db import models

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
    sla = models.CharField(max_length=20)  # You could also convert this to a DurationField if needed
    description = models.TextField()
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)

    category = models.CharField(max_length=100, blank=True, null=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.ticket_id} - {self.subject}"
