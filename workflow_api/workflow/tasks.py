from celery import shared_task
from workflow.models import Workflows
from workflow.serializers import FullWorkflowSerializer
from workflow_api.celery import app  # Your Celery instance
import logging
import json
from django.apps import apps

logger = logging.getLogger(__name__)

@shared_task(name="workflow.tasks.recieve_workflow")
def send_to_consumer(workflow_id):
    """
    Fetches the workflow, serializes it, and sends it to the consumer queue.
    """
    try:
        # Dynamically get the Workflows model
        Workflows = apps.get_model("workflow", "Workflows")
        workflow = Workflows.objects.get(workflow_id=workflow_id)

        # Serialize the full workflow to a flat dict
        serializer = FullWorkflowSerializer()
        serialized_data = serializer.get_workflow(workflow)

        # Send directly as kwargs.payload
        app.send_task(
            "workflow.tasks.recieve_workflow",  # ensure name matches consumer task
            kwargs={"payload": serialized_data},
            queue="workflow_send_queue"
        )
        logger.info(f"Dispatched workflow {workflow_id} to consumer")

    except Workflows.DoesNotExist:
        logger.error(f"Workflow with ID {workflow_id} does not exist")


@shared_task(name="workflow.send_hello")
def send_hello():
    app.send_task(
        "receive_hello",
        kwargs={"payload": {"message": "Hello"}},
        queue="workflow_send_queue"
    )

@shared_task(name="workflow.tasks.commit")
def send_workflow_over_queue(workflow_id):
    try:
        workflow = Workflows.objects.get(workflow_id=workflow_id)
        serialized = FullWorkflowSerializer(workflow).data

        app.send_task(
            "workflow.tasks.receive_workflow",
            kwargs={"payload": 'hello'},
            queue="workflow_send_queue"
        )
        logger.info("Serialized workflow:\n%s", json.dumps(serialized, indent=2))
    except Workflows.DoesNotExist:
        logger.error(f"Workflow with workflow_id={workflow_id} not found.")
    except Exception as e:
        logger.exception(f"Error serializing workflow_id={workflow_id}: {e}")
        raise