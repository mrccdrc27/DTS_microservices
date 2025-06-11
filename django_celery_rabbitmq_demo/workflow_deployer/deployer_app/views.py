from django.http import JsonResponse
from celery import Celery

# Create a Celery client connected to RabbitMQ
celery_app = Celery('deployer', broker='amqp://guest:guest@localhost:5672//')

def deploy_workflow(request):
    workflow_data = {
        "id": 1,
        "name": "Sample Workflow",
        "status": "deployed"
    }

    # Send task to the other service's queue
    celery_app.send_task(
    "listener_app.tasks.receive_workflow_update",
    args=[workflow_data],
    queue='workflow_updates'  # 👈 VERY IMPORTANT
)
    return JsonResponse({"message": "Workflow deployment triggered!"})
