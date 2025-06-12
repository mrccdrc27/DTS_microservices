from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from role.models import Roles
from action.models import Actions
from workflow.models import Workflows, Category
from step.models import Steps, StepTransition
from django.core.exceptions import ValidationError


class Command(BaseCommand):
    help = 'Seed workflows with step-specific actions and robust transitions.'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Seed Roles (previously Positions)
            # for name, uid in [('Requester', 1), ('Reviewer', 2), ('Approver', 3)]:
            #     Roles.objects.get_or_create(
            #         name=name,
            #         defaults={'user_id': uid, 'description': f'{name} role'}
            #     )
            # self.stdout.write(self.style.SUCCESS('Roles seeded.'))

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
                        name=wf_name,
                        defaults={
                            'user_id': 1,
                            'description': f'{wf_name} workflow',
                            'category': main_cat,
                            'sub_category': sub_cat,
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
                            workflow_id=wf,
                            name=step_name,
                            defaults={
                                'description': label,
                                'order': idx + 1,
                                'role_id': Roles.objects.get(name=role)
                            }
                        )
                        step_objs.append(step)

                    # Create actions and transitions
                    for idx, (label, _, events) in enumerate(steps_cfg):
                        step = step_objs[idx]
                        for event in events:
                            # Unique action per step-event
                            act_name = f"{step.name} - {event}"
                            action, _ = Actions.objects.get_or_create(
                                name=act_name,
                                defaults={'description': f'{event} action on {step.name}'}
                            )

                            # Determine transition endpoints
                            if event == 'start':
                                frm, to = None, step
                            elif event == 'submit':
                                frm, to = step, step_objs[idx + 1] if idx + 1 < len(step_objs) else None
                            elif event == 'approve':
                                frm, to = step, step_objs[idx + 1] if idx + 1 < len(step_objs) else None
                            elif event == 'reject':
                                frm, to = step, step_objs[idx - 1] if idx > 0 else None
                            else:  # complete
                                frm, to = step, None

                            # Create transition with updated field names
                            try:
                                StepTransition.objects.get_or_create(
                                    from_step_id=frm,
                                    to_step_id=to,
                                    action_id=action
                                )
                            except (ValidationError, IntegrityError):
                                # Skip invalid or duplicate transitions
                                continue

            self.stdout.write(self.style.SUCCESS(
                'Seeding complete: workflows, steps, actions, transitions.'
            ))