from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from task.models import Task

@receiver([post_save, post_delete], sender=Task)
def create_step_instance(sender, instance, **kwargs):
    print('task movement detected')