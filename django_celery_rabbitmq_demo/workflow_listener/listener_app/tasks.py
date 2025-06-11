from celery import shared_task
from listener_app.models import WorkflowMessage

@shared_task(bind=True, acks_late=True)
def receive_workflow_update(self, data):
    print("📥 Received workflow data:", data)
    WorkflowMessage.objects.create(
        external_id=data["id"],
        name=data["name"],
        status=data["status"]
    )
    return "Saved"
