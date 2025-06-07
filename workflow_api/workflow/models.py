from django.db import models
from positions.models import Positions
from workflow_api.action.models import Actions

STATUS_CHOICES = [
    ("draft", "Draft"),
    ("deployed", "Deployed"),
    ("paused", "Paused"),
    ("initialized", "Initialized"),
]

class Category(models.Model):
    name = models.CharField(max_length=64, unique=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='subcategories',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class Workflows(models.Model):
    userID = models.IntegerField(null=False)
    workflowName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)

    # Use category references
    mainCategory = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='main_workflows'
    )
    subCategory = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='sub_workflows'
    )

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    isInitialized = models.BooleanField(default=False)


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
    condition = models.CharField(max_length=128, null=True, blank=True)


class StepActions(models.Model):
    action = models.ForeignKey(Actions, on_delete=models.CASCADE)
    step = models.ForeignKey(Steps, on_delete=models.CASCADE)
