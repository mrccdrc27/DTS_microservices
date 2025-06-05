from django.db import models
from positions.models import Positions
from action.models import Actions

STATUS_CHOICES = [
    ("draft", "Draft"),
    ("deployed", "Deployed"),
    ("paused", "Paused"),
    ("initialized", "Initialized"),
]
class Workflows(models.Model):
    # used to track who creates the workflow
    userID = models.IntegerField(null=False)
    # Must be unique
    workflowName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    mainCategory = models.CharField(max_length=64, null=False)
    subCategory = models.CharField(max_length=64, null=False)
    # Status field with choices
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    isInitialized = models.BooleanField(default=False)
    
from django.db import models

class Steps(models.Model):
    workflow = models.ForeignKey(Workflows, on_delete=models.CASCADE)
    position = models.ForeignKey(Positions, on_delete=models.PROTECT)
    stepName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    isInitialized = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.stepName} (Order: {self.order})"
    
class StepTransition(models.Model):
    from_step = models.ForeignKey(Steps, related_name='outgoing_transitions', on_delete=models.CASCADE, null=True)
    to_step = models.ForeignKey(Steps, related_name='incoming_transitions', on_delete=models.CASCADE)
    condition = models.CharField(max_length=128, null=True, blank=True)  # Optional


class StepActions(models.Model):
    action = models.ForeignKey(Actions, on_delete=models.CASCADE)
    step = models.ForeignKey(Steps, on_delete=models.CASCADE)


    
