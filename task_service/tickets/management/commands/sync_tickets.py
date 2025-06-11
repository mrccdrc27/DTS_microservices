# management/commands/sync_tickets.py
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from ...models import WorkflowTicket  # Use relative import from the app
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync tickets from ticket service'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--ticket-service-url',
            type=str,
            default='http://localhost:8000',
            help='Ticket service URL'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Number of tickets to fetch'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be synced without actually creating records'
        )
    
    def handle(self, *args, **options):
        ticket_service_url = options['ticket_service_url']
        limit = options['limit']
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No records will be created'))
        
        try:
            # Fetch tickets from ticket service
            self.stdout.write(f'Fetching tickets from {ticket_service_url}...')
            
            response = requests.get(
                f"{ticket_service_url}/api/tickets/",
                params={'limit': limit},
                timeout=30,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                tickets_data = response.json()
                
                # Handle different response formats
                if isinstance(tickets_data, dict):
                    # If response is paginated: {'results': [...], 'count': x}
                    tickets_list = tickets_data.get('results', tickets_data.get('data', [tickets_data]))
                elif isinstance(tickets_data, list):
                    tickets_list = tickets_data
                else:
                    self.stdout.write(self.style.ERROR('Unexpected response format'))
                    return
                
                self.stdout.write(f'Found {len(tickets_list)} tickets to process')
                
                synced_count = 0
                skipped_count = 0
                error_count = 0
                
                for ticket_data in tickets_list:
                    try:
                        original_ticket_id = ticket_data.get('ticket_id')
                        if not original_ticket_id:
                            self.stdout.write(
                                self.style.WARNING(f'Skipping ticket without ticket_id: {ticket_data}')
                            )
                            skipped_count += 1
                            continue
                        
                        # Check if already exists
                        if WorkflowTicket.objects.filter(
                            original_ticket_id=original_ticket_id
                        ).exists():
                            self.stdout.write(
                                self.style.WARNING(f'Ticket {original_ticket_id} already exists, skipping')
                            )
                            skipped_count += 1
                            continue
                        
                        if not dry_run:
                            # Create new workflow ticket
                            workflow_ticket_data = {
                                'original_ticket_id': original_ticket_id,
                                'source_service': 'ticket_service',
                                'subject': ticket_data.get('subject', ''),
                                'customer': ticket_data.get('customer', ''),
                                'priority': ticket_data.get('priority', 'Low'),
                                'status': ticket_data.get('status', 'Open'),
                                'opened_on': ticket_data.get('opened_on'),
                                'sla': ticket_data.get('sla', ''),
                                'description': ticket_data.get('description', ''),
                                'department': ticket_data.get('department', ''),
                                'position': ticket_data.get('position', ''),
                                'category': ticket_data.get('category'),
                                'subcategory': ticket_data.get('subcategory'),
                            }
                            
                            # Remove None values
                            workflow_ticket_data = {k: v for k, v in workflow_ticket_data.items() if v is not None}
                            
                            WorkflowTicket.objects.create(**workflow_ticket_data)
                            self.stdout.write(f'Created workflow ticket for {original_ticket_id}')
                        else:
                            self.stdout.write(f'Would create workflow ticket for {original_ticket_id}')
                        
                        synced_count += 1
                        
                    except Exception as e:
                        error_count += 1
                        self.stdout.write(
                            self.style.ERROR(f'Error processing ticket {ticket_data.get("ticket_id", "unknown")}: {str(e)}')
                        )
                        logger.error(f'Error syncing ticket: {str(e)}', exc_info=True)
                
                # Summary
                self.stdout.write(self.style.SUCCESS(f'\nSync Summary:'))
                self.stdout.write(f'  Successfully synced: {synced_count}')
                self.stdout.write(f'  Skipped (already exist): {skipped_count}')
                self.stdout.write(f'  Errors: {error_count}')
                
                if dry_run:
                    self.stdout.write(self.style.WARNING('This was a dry run - no records were actually created'))
                
            else:
                self.stdout.write(
                    self.style.ERROR(f'Failed to fetch tickets: HTTP {response.status_code}')
                )
                self.stdout.write(f'Response: {response.text[:500]}')
                
        except requests.RequestException as e:
            self.stdout.write(
                self.style.ERROR(f'Network error while fetching tickets: {str(e)}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error syncing tickets: {str(e)}')
            )
            logger.error(f'Unexpected error in sync_tickets command: {str(e)}', exc_info=True)