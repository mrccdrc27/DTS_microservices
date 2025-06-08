from django.core.management.base import BaseCommand
from django.db import transaction
from role.models import Positions
from action.models import Actions
from workflow.models import Workflows, Category
from step.models import Steps, StepActions, StepTransition
from django.core.exceptions import ValidationError

class Command(BaseCommand):
    help = 'Seed data matching workflow models: Categories, Actions, Positions, Workflows, Steps, StepActions, StepTransitions.'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Seed Actions
            base_actions = [
                'start', 'approve', 'reject', 'complete'
            ]
            for name in base_actions:
                Actions.objects.get_or_create(
                    actionName=name,
                    defaults={'description': f'Default action: {name}'}
                )
            self.stdout.write(self.style.SUCCESS('Actions seeded.'))

            # Seed Positions
            roles = [
                {'positionName': 'Requester', 'userID': 1},
                {'positionName': 'Reviewer', 'userID': 2},
                {'positionName': 'Approver', 'userID': 3},
            ]
            for r in roles:
                Positions.objects.get_or_create(
                    positionName=r['positionName'],
                    defaults={'userID': r['userID'], 'description': f"Role {r['positionName']}"}
                )
            self.stdout.write(self.style.SUCCESS('Positions seeded.'))

            # Categories for 3x3 workflows
            main_names = ['General Inquiry', 'Technical Issue', 'Billing']
            sub_names = ['Software', 'Hardware', 'Payment']

            for main in main_names:
                main_cat, _ = Category.objects.get_or_create(name=main, parent=None)
                for sub in sub_names:
                    sub_cat, _ = Category.objects.get_or_create(name=sub, parent=main_cat)

                    # Create Workflow
                    wf_name = f"{main} - {sub}"
                    wf, created = Workflows.objects.get_or_create(
                        workflowName=wf_name,
                        defaults={
                            'userID': 1,
                            'description': f'{wf_name} workflow',
                            'mainCategory': main_cat,
                            'subCategory': sub_cat,
                            'status': 'draft',
                        }
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Workflow "{wf.workflowName}" {'created' if created else 'exists'}')
                    )

                    # Seed Steps, Actions, StepActions, Transitions
                    prev_step = None
                    for order, label in enumerate(['Submit', 'Review', 'Finalize'], start=1):
                        step_name = f"{wf.workflowName} - {label}"
                        step, _ = Steps.objects.get_or_create(
                            workflow=wf,
                            stepName=step_name,
                            defaults={
                                'description': f'{label} step',
                                'order': order,
                                'position': Positions.objects.get(positionName=['Requester','Reviewer','Approver'][order-1])
                            }
                        )

                        # Unique action for this step
                        action_name = f"{step_name} Action"
                        action, _ = Actions.objects.get_or_create(
                            actionName=action_name,
                            defaults={'description': f'Action for {step_name}'}
                        )

                        # Link step to action
                        StepActions.objects.get_or_create(step=step, action=action)

                        # Create transition from prev_step to this step
                        if not StepTransition.objects.filter(action=action).exists():
                            try:
                                StepTransition.objects.create(
                                    from_step=prev_step,
                                    to_step=step,
                                    action=action
                                )
                            except ValidationError:
                                pass
                        prev_step = step

                    # Final transition from last step to None
                    final_action = Actions.objects.get(actionName=f"{wf.workflowName} - Finalize Action")
                    if not StepTransition.objects.filter(action=final_action, from_step=prev_step, to_step=None).exists():
                        StepTransition.objects.create(
                            from_step=prev_step,
                            to_step=None,
                            action=final_action
                        )

            self.stdout.write(self.style.SUCCESS('Seeding complete.'))
