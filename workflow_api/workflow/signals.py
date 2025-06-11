from django.db.models.signals import post_save, post_delete
import requests
import logging
from django.dispatch import receiver
from step.models import Steps, StepTransition
from workflow.utils import compute_workflow_status
from .models import Workflows
from .serializers import FullWorkflowSerializer

def get_workflow_id_from_instance(instance):
    # If this is a Step, instance.workflow_id is the FK to Workflows
    if hasattr(instance, "workflow_id") and instance.workflow_id:
        return instance.workflow_id.workflow_id

    # If this is a Transition, pull the step then its workflow
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


logger = logging.getLogger(__name__)

EXTERNAL_URL = "http://localhost:4000/workflow/sync/"  # 🔁 Replace with actual URL

@receiver(post_save, sender=Workflows)
def push_initialized_workflow(sender, instance: Workflows, created, **kwargs):
    # Only push if status is "initialized"
    if instance.status != "initialized":
        return

    try:
        # Serialize the full workflow
        data = FullWorkflowSerializer(instance).data

        # Push via POST
        response = requests.post(EXTERNAL_URL, json=data, timeout=10)

        if response.status_code in [200, 201]:
            logger.info(f"Successfully pushed workflow {instance.workflow_id}")
        else:
            logger.warning(f"Failed to push workflow {instance.workflow_id}: {response.status_code} - {response.text}")

    except Exception as e:
        logger.exception(f"Error while pushing workflow {instance.workflow_id}: {str(e)}")