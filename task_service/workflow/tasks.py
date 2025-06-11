# task_service/workflow/tasks.py

from celery import shared_task
from .serializers import WorkflowDeserializer
from .models import Workflows, Category
from step.models import Steps, StepTransition
from role.models import Roles
from action.models import Actions
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

@shared_task(name="receive_workflow")
def receive_workflow(payload: dict):
    logger.info("Received workflow payload")

    serializer = WorkflowDeserializer(data=payload.get("workflow"))
    if not serializer.is_valid():
        logger.error("Invalid workflow payload")
        return

    data = serializer.validated_data

    with transaction.atomic():
        # Category
        cat_data = data["category"]
        subcat_data = data["sub_category"]
        category, _ = Category.objects.update_or_create(category_id=cat_data["category_id"], defaults=cat_data)
        sub_category, _ = Category.objects.update_or_create(category_id=subcat_data["category_id"], defaults=subcat_data)

        # Role (optional)
        role_obj = None
        if data.get("role"):
            role_data = data["role"]
            role_obj, _ = Roles.objects.update_or_create(role_id=role_data["role_id"], defaults=role_data)

        # Workflow
        workflow, _ = Workflows.objects.update_or_create(
            workflow_id=data["workflow_id"],
            defaults={
                "name": data["name"],
                "description": data["description"],
                "status": data["status"],
                "user_id": data["user_id"],
                "category": category,
                "sub_category": sub_category
            }
        )

        # Actions
        for action in data["actions"]:
            Actions.objects.update_or_create(action_id=action["action_id"], defaults=action)

        # Steps
        for step in data["steps"]:
            Steps.objects.update_or_create(step_id=step["step_id"], defaults={**step, "workflow_id": workflow})

        # Transitions
        for t in data["transitions"]:
            StepTransition.objects.update_or_create(transition_id=t["transition_id"], defaults=t)

    logger.info(f"Workflow {workflow.workflow_id} synced successfully")

@shared_task(name="receive_hello")
def receive_hello(payload):
    """Simple consumer that receives the message"""
    logger.info(f"Received payload: {payload}")
    
    message = payload.get("message", "No message")
    print(f"Consumer got: {message}")
    
    return f"Successfully processed: {message}"