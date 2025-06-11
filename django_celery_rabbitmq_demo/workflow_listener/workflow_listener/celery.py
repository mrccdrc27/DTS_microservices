# workflow_listener/workflow_listener/celery.py

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workflow_listener.settings')

app = Celery('workflow_listener')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
