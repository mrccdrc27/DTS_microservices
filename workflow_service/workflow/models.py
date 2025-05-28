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
    
class Steps(models.Model):
    # ensure to delete the Steps table when parent is gone
    workflow = models.ForeignKey(Workflows, on_delete=models.CASCADE)
    position = models.ForeignKey(Positions, on_delete=models.PROTECT)
    stepName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    isInitialized = models.BooleanField(default=False)

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

class StepActions(models.Model):
    action = models.ForeignKey(Actions, on_delete=models.CASCADE)
    step = models.ForeignKey(Steps, on_delete=models.CASCADE)


    
