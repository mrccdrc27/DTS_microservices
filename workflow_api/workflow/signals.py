from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from step.models import Steps, StepTransition
from workflow.utils import compute_workflow_status
from .models import Workflows
import logging

logger = logging.getLogger(__name__)

def get_workflow_id_from_instance(instance):
    if hasattr(instance, "workflow_id") and instance.workflow_id:
        return instance.workflow_id.workflow_id

    from_step = getattr(instance, "from_step_id", None)
    if from_step and from_step.workflow_id:
        return from_step.workflow_id.workflow_id

    to_step = getattr(instance, "to_step_id", None)
    if to_step and to_step.workflow_id:
        return to_step.workflow_id.workflow_id

    return None

@receiver([post_save, post_delete], sender=Steps)
@receiver([post_save, post_delete], sender=StepTransition)
def update_workflow_status(sender, instance, **kwargs):
    workflow_id = get_workflow_id_from_instance(instance)
    if workflow_id:
        compute_workflow_status(workflow_id)

# No more push to localhost — this signal now only reacts to status changes.
@receiver(post_save, sender=Workflows)
def push_initialized_workflow(sender, instance: Workflows, created, **kwargs):
    if instance.status == "initialized":
        logger.info(f"Workflow {instance.workflow_id} is initialized. No external sync triggered.")
