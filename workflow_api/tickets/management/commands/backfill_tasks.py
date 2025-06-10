# tickets/management/commands/backfill_tasks.py

from django.core.management.base import BaseCommand
from tickets.models import WorkflowTicket
from tickets.utils import allocate_task_for_ticket

class Command(BaseCommand):
    help = "Backfill Task allocation for tickets with is_task_allocated=False."

    def handle(self, *args, **opts):
        for ticket in WorkflowTicket.objects.filter(is_task_allocated=False):
            if allocate_task_for_ticket(ticket):
                ticket.is_task_allocated = True
                ticket.save(update_fields=['is_task_allocated'])
                self.stdout.write(f"Allocated Task for {ticket.ticket_id}")
