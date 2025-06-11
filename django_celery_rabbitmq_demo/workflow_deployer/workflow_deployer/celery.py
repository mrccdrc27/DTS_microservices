# workflow_deployer/workflow_deployer/celery.py

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workflow_deployer.settings')

app = Celery('workflow_deployer')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
