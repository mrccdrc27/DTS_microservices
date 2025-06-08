from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from role.models import Positions
from action.models import Actions
from workflow.models import Workflows, Category
from step.models import Steps, StepActions, StepTransition
from django.core.exceptions import ValidationError


class Command(BaseCommand):
    help = 'Seed workflows with step-specific actions and robust transitions.'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Seed Positions
            for name, uid in [('Requester', 1), ('Reviewer', 2), ('Approver', 3)]:
                Positions.objects.get_or_create(
                    positionName=name,
                    defaults={'userID': uid, 'description': f'{name} role'}
                )
            self.stdout.write(self.style.SUCCESS('Positions seeded.'))

            main_names = ['General Inquiry', 'Technical Issue', 'Billing']
            sub_names = ['Software', 'Hardware', 'Payment']

            for main in main_names:
                main_cat, _ = Category.objects.get_or_create(name=main, parent=None)
                for sub in sub_names:
                    # Ensure subcategory exists (unique constraint on name)
                    try:
                        sub_cat, _ = Category.objects.get_or_create(name=sub, parent=main_cat)
                    except IntegrityError:
                        sub_cat = Category.objects.get(name=sub)

                    wf_name = f"{main} - {sub}"
                    wf, created = Workflows.objects.get_or_create(
                        workflowName=wf_name,
                        defaults={
                            'userID': 1,
                            'description': f'{wf_name} workflow',
                            'mainCategory': main_cat,
                            'subCategory': sub_cat,
                            'status': 'draft'
                        }
                    )
                    self.stdout.write(self.style.SUCCESS(
                        f'Workflow "{wf_name}" {"created" if created else "exists"}.'
                    ))

                    # Define step configurations
                    steps_cfg = [
                        ('Submit Form', 'Requester', ['start', 'submit']),
                        ('Review Documents', 'Reviewer', ['approve', 'reject']),
                        ('Final Approval', 'Approver', ['complete']),
                    ]

                    # Create step objects
                    step_objs = []
                    for idx, (label, role, _) in enumerate(steps_cfg):
                        step_name = f"{wf_name} - {label}"
                        step, _ = Steps.objects.get_or_create(
                            workflow=wf,
                            stepName=step_name,
                            defaults={
                                'description': label,
                                'order': idx + 1,
                                'position': Positions.objects.get(positionName=role)
                            }
                        )
                        step_objs.append(step)

                    # Create actions, step-actions, and transitions
                    for idx, (label, _, events) in enumerate(steps_cfg):
                        step = step_objs[idx]
                        for event in events:
                            # Unique action per step-event
                            act_name = f"{step.stepName} - {event}"
                            action, _ = Actions.objects.get_or_create(
                                actionName=act_name,
                                defaults={'description': f'{event} action on {step.stepName}'}
                            )
                            StepActions.objects.get_or_create(step=step, action=action)

                            # Determine transition endpoints
                            if event == 'start':
                                frm, to = None, step
                            elif event == 'submit':
                                frm, to = step, step_objs[idx + 1]
                            elif event == 'approve':
                                frm, to = step, step_objs[idx + 1]
                            elif event == 'reject':
                                frm, to = step, step_objs[idx - 1]
                            else:  # complete
                                frm, to = step, None

                            # Ensure unique(prev_step, action)
                            try:
                                StepTransition.objects.get_or_create(
                                    from_step=frm,
                                    to_step=to,
                                    action=action
                                )
                            except ValidationError:
                                # Skip invalid or duplicate transitions
                                continue

            self.stdout.write(self.style.SUCCESS(
                'Seeding complete: workflows, steps, actions, transitions.'
            ))
