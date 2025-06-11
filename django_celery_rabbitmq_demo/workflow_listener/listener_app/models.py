from django.db import models

class WorkflowMessage(models.Model):
    external_id = models.IntegerField()
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.status})"
