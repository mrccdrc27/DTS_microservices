from django.core.management.base import BaseCommand
from tickets.models import Ticket
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seed the database with realistic sample tickets'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reseeding by deleting existing data first',
        )

    def handle(self, *args, **options):
        if options['force']:
            self.stdout.write("Force mode: deleting all existing tickets...")
            Ticket.objects.all().delete()
        elif Ticket.objects.exists():
            self.stdout.write(self.style.WARNING("Tickets already exist. Use --force to reseed."))
            return

        fake = Faker()
        priorities = ['Low', 'Medium', 'High', 'Urgent']
        statuses = ['Open', 'In Progress', 'Resolved', 'Closed', 'On Hold']
        departments = ['Support', 'IT', 'Sales', 'HR', 'Finance', 'Legal']
        positions = ['IT Analyst', 'Support Rep', 'Manager', 'Technician', 'Consultant', 'Coordinator']
        sla_options = ['24 hours', '48 hours', '72 hours', '1 week']

        for i in range(1, 21):
            opened = fake.date_between(start_date='-30d', end_date='today')
            ticket = Ticket.objects.create(
                ticket_id=f"TK-{100000 + i}",
                subject=fake.sentence(nb_words=5),
                customer=fake.name(),
                priority=random.choice(priorities),
                status=random.choice(statuses),
                opened_on=opened,
                sla=random.choice(sla_options),
                description=fake.paragraph(nb_sentences=3),
                department=random.choice(departments),
                position=random.choice(positions),
            )
            self.stdout.write(f"Created: {ticket.ticket_id} - {ticket.subject}")

        self.stdout.write(self.style.SUCCESS("✅ Seeded 20 realistic tickets."))
