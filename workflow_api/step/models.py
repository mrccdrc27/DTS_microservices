from django.db import models
from role.models import Positions
from action.models import Actions
from django.core.exceptions import ValidationError

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

# class StepTransition(models.Model):
#     from_step = models.ForeignKey(Steps, related_name='outgoing_transitions', on_delete=models.CASCADE, null=True)
#     to_step = models.ForeignKey(Steps, related_name='incoming_transitions', on_delete=models.CASCADE, null=True)
#     action  = models.ForeignKey(Actions, on_delete=models.PROTECT, null=True)
    
#         # action must be unique for each transition
#         # 

class StepTransition(models.Model):
    from_step = models.ForeignKey(
        Steps,
        related_name='outgoing_transitions',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    to_step = models.ForeignKey(
        Steps,
        related_name='incoming_transitions',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    action = models.ForeignKey(
        Actions,
        on_delete=models.CASCADE,
        null=True,
        unique=True,  # enforce one-to-one between Action and StepTransition
    )

    class Meta:
        constraints = [
            # this is redundant if you use unique=True above, but shown here
            models.UniqueConstraint(
                fields=['action'],
                name='unique_action_per_transition'
            )
        ]

    def clean(self):
        super().clean()

        # 1) No self-loop
        if self.from_step and self.to_step and self.from_step_id == self.to_step_id:
            raise ValidationError("from_step and to_step must be different")

        # 2) Same-workflow guard
        if self.from_step and self.to_step and (
            self.from_step.workflow_id != self.to_step.workflow_id
        ):
            raise ValidationError("from_step and to_step must belong to the same workflow")

    def save(self, *args, **kwargs):
        # ensure clean() runs on every save
        self.full_clean()
        super().save(*args, **kwargs)


class StepActions(models.Model):
    action = models.ForeignKey(Actions, on_delete=models.CASCADE)
    step = models.ForeignKey(Steps, on_delete=models.CASCADE)


