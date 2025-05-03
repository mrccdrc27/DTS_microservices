from django.db import models

class Task(models.Model):
    taskId = models.AutoField(primary_key=True)
    ticketId = models.IntegerField()  # or models.UUIDField() if using UUIDs
    workflowId = models.IntegerField()  # or models.UUIDField()
    status = models.CharField(max_length=100)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Task {self.taskId} - Status: {self.status}"
