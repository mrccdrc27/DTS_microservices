from celery import shared_task

@shared_task(name='role.tasks.recieve_role')
def push_role(role_data):
    # This will be picked up and executed by `workflow_api`
    pass
