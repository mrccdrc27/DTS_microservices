from django.db import models
from role.models import Positions
from action.models import Actions

class Steps(models.Model):
    workflow = models.ForeignKey('workflow.Workflows', on_delete=models.CASCADE)
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

    def get_workflow(self):
        # Optional: only if you need to reference it somewhere dynamically
        from workflow.models import Workflows
        return Workflows.objects.first()

class StepTransition(models.Model):
    from_step = models.ForeignKey(Steps, related_name='outgoing_transitions', on_delete=models.CASCADE, null=True)
    to_step = models.ForeignKey(Steps, related_name='incoming_transitions', on_delete=models.CASCADE)
    condition = models.CharField(max_length=128, null=True, blank=True)


class StepActions(models.Model):
    action = models.ForeignKey(Actions, on_delete=models.CASCADE)
    step = models.ForeignKey(Steps, on_delete=models.CASCADE)
