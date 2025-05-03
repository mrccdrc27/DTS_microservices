

from django.db import models

class Workflow(models.Model):
    workflowId = models.AutoField(primary_key=True)
    createdBy = models.IntegerField()  # Just store the user ID
    description = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Workflow {self.workflowId} by {self.createdBy}"


class Position(models.Model):
    positionId = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name


class Placement(models.Model):
    placementId = models.AutoField(primary_key=True)
    workflowId = models.IntegerField()  # Storing Workflow ID
    positionId = models.IntegerField()  # Storing Position ID

    def __str__(self):
        return f"Placement {self.placementId} linking Workflow {self.workflowId} and Position {self.positionId}"
