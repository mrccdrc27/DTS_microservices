from django.db import IntegrityError
from django.utils import timezone
from workflow.models import Workflows
from task.models import Task

def allocate_task_for_ticket(ticket):
    """
    Create Tasks for every Workflows entry whose
    category.name == ticket.category (case‐insensitive)
    AND sub_category.name == ticket.subcategory.
    Returns True if at least one Task was created (or already existed).
    """
    cat = ticket.category.strip()
    sub = ticket.subcategory.strip()

    if not cat or not sub:
        return False

    # find matching workflows directly by name
    workflows = Workflows.objects.filter(
        category__name__iexact=cat,
        sub_category__name__iexact=sub
    )

    created_any = False
    for wf in workflows:
        try:
            Task.objects.create(
                ticket_id=ticket,
                workflow_id=wf,
                fetched_at=ticket.fetched_at or timezone.now()
            )
            created_any = True
        except IntegrityError:
            # already exists
            created_any = True

    return created_any
