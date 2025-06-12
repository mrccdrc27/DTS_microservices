# task_service/workflow/tasks.py

from celery import shared_task
from .serializers import WorkflowDeserializer
from .models import Workflows, Category
from step.models import Steps, StepTransition
from role.models import Roles
from action.models import Actions
from django.db import transaction
import logging

from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)
from .services.workflow_commit_service import commit_workflow_json 

@shared_task(name="workflow.tasks.commit")
def commit(payload):
    """
    Celery task to receive workflow JSON data and commit it to the database.
    """
    logger.info("Received workflow payload for commit")

    try:
        # Commit workflow JSON using the service class
        result = commit_workflow_json(payload)
        logger.info("Workflow commit successful")
        logger.debug(f"Commit report: {result}")
    except ValidationError as ve:
        logger.error(f"Invalid workflow payload: {ve.message_dict if hasattr(ve, 'message_dict') else str(ve)}")
    except Exception as e:
        logger.exception("Unhandled error during workflow commit")


@shared_task(name="receive_hello")
def receive_hello(payload):
    """Simple consumer that receives the message"""
    logger.info(f"Received payload: {payload}")
    
    message = payload.get("message", "No message")
    print(f"Consumer got: {message}")
    
    return f"Successfully processed: {message}"