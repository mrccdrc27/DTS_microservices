from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from task.models import Task
from step_instance.models import StepInstance
from step.models import StepTransition

@receiver([post_save, post_delete], sender=Task)
# def create_step_instance(sender, instance, **kwargs):
#     print('Task movement detected')

#     if not instance.workflow_id:
#         print('Task has no workflow_id — skipping.')
#         return

#     # Find the entry transition (from_step is null) for this workflow
#     entry_transition = StepTransition.objects.filter(
#         workflow_id=instance.workflow_id,
#         from_step_id__isnull=True
#     ).first()

#     if not entry_transition:
#         print(f"No entry transition found for workflow {instance.workflow_id}")
#         return

#     # Prevent duplicate step instance for this task-transition
#     if StepInstance.objects.filter(
#         task_id=instance.task_id,
#         step_transition_id=entry_transition.transition_id
#     ).exists():
#         print(f"StepInstance already exists for Task {instance.task_id}")
#         return

#     # Create StepInstance
#     StepInstance.objects.create(
#         task_id=instance,  # ForeignKey to Task using `to_field='task_id'`
#         step_transition_id=entry_transition,  # FK to StepTransition using `to_field='transition_id'`
#     )

#     print(f"StepInstance created for Task {instance.task_id} at step {entry_transition.to_step_id}")
def create_step_instance(sender, instance, **kwargs):
    print ('testinstance',instance.workflow_id)
    entry_transition = StepTransition.objects.filter(
    workflow_id=instance.workflow_id,
    from_step_id__isnull=True
    ).first()

    # Create StepInstance
    StepInstance.objects.create(
        task_id=instance,  # ForeignKey to Task using `to_field='task_id'`
        step_transition_id=entry_transition,  # FK to StepTransition using `to_field='transition_id'`
    )
    

    # print(f"StepInstance created for Task {instance.task_id} at step {entry_transition.to_step_id}")