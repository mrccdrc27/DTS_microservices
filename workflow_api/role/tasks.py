from celery import shared_task
from role.models import Roles
from datetime import datetime
from django.utils.timezone import make_aware


@shared_task(name='role.tasks.recieve_role')  # 👈 match this name!
def recieve_role(role_data):
    try:
        Roles.objects.create(**role_data)
        return {"status": "success", "role_id": role_data.get("role_id")}
    
    except Exception as e:
        return {"status": "error", "error": str(e)}