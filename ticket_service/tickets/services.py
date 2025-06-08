# services.py
import requests
from django.conf import settings
from django.utils import timezone
from .models import Ticket
from .serializers import TicketPushSerializer
import logging
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .models import TicketPushQueue
from django.utils import timezone
import traceback

logger = logging.getLogger(__name__)

class WorkflowPushService:
    def __init__(self):
        self.workflow_base_url = 'http://localhost:2000'
        self.timeout = getattr(settings, 'WORKFLOW_SERVICE_TIMEOUT', 30)
        self.max_retries = getattr(settings, 'WORKFLOW_PUSH_MAX_RETRIES', 3)
        self.retry_delay = getattr(settings, 'WORKFLOW_PUSH_RETRY_DELAY', 5)  # seconds
        
        # Setup session with retry strategy
        self.session = requests.Session()
        
        # Updated retry strategy with correct parameter name
        retry_strategy = Retry(
            total=self.max_retries,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS", "POST"],  # Changed from method_whitelist
            backoff_factor=1
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def process_retry_queue(self):
        processed = []
        now = timezone.now()

        # Get all pending or retryable tickets, optionally filter by scheduled_for
        queue_items = TicketPushQueue.objects.filter(
            status__in=['pending', 'failed'],
        ).filter(
            scheduled_for__isnull=True
        ) | TicketPushQueue.objects.filter(
            scheduled_for__lte=now
        )

        for item in queue_items:
            try:
                item.status = 'processing'
                item.save()

                result = self.push_ticket_to_workflow(item.ticket.id)

                if result['success']:
                    item.status = 'completed'
                    item.ticket.pushed_to_workflow = True
                    item.ticket.workflow_push_at = now
                    item.ticket.save()
                    result_status = 'success'
                else:
                    item.retry_count += 1
                    item.last_error = result.get('error', 'Unknown error')
                    item.status = 'failed' if item.retry_count >= item.max_retries else 'pending'
                    item.scheduled_for = now + timezone.timedelta(minutes=5)  # retry delay
                    result_status = 'failed'

                item.save()

                processed.append({
                    'ticket_id': item.ticket.ticket_id,
                    'result': result_status
                })

            except Exception as e:
                item.retry_count += 1
                item.last_error = traceback.format_exc()
                item.status = 'failed' if item.retry_count >= item.max_retries else 'pending'
                item.scheduled_for = now + timezone.timedelta(minutes=10)
                item.save()

                processed.append({
                    'ticket_id': item.ticket.ticket_id,
                    'result': 'exception'
                })

        return processed
    
    def push_ticket_to_workflow(self, ticket_id, retry_count=0):
        """Push a ticket to the workflow service with retry logic"""
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            
            # Skip if already pushed
            if ticket.pushed_to_workflow:
                logger.info(f"Ticket {ticket.ticket_id} already pushed to workflow")
                return {'success': True, 'message': 'Already pushed', 'workflow_id': ticket.workflow_ticket_id}
            
            # Serialize ticket data
            serializer = TicketPushSerializer(ticket)
            ticket_data = serializer.data
            
            # Add metadata
            ticket_data['original_ticket_id'] = ticket.ticket_id
            ticket_data['source_service'] = 'ticket_service'
            
            # Make request with retry logic
            for attempt in range(self.max_retries + 1):
                try:
                    response = self.session.post(
                        f"{self.workflow_base_url}/workflow/tickets/",
                        json=ticket_data,
                        headers={'Content-Type': 'application/json'},
                        timeout=self.timeout
                    )
                    
                    if response.status_code in [200, 201]:
                        workflow_data = response.json()
                        
                        # Update ticket with workflow info
                        ticket.pushed_to_workflow = True
                        ticket.workflow_push_at = timezone.now()
                        ticket.workflow_ticket_id = workflow_data.get('id') or workflow_data.get('ticket_id')
                        ticket.save()
                        
                        logger.info(f"Successfully pushed ticket {ticket.ticket_id} to workflow (attempt {attempt + 1})")
                        return {
                            'success': True, 
                            'workflow_id': ticket.workflow_ticket_id,
                            'message': f'Ticket pushed successfully on attempt {attempt + 1}'
                        }
                    else:
                        logger.warning(f"Workflow service returned {response.status_code} for ticket {ticket.ticket_id} (attempt {attempt + 1})")
                        if attempt < self.max_retries:
                            time.sleep(self.retry_delay * (attempt + 1))  # Exponential backoff
                            continue
                        else:
                            return {
                                'success': False, 
                                'error': f"Workflow service returned {response.status_code} after {self.max_retries + 1} attempts",
                                'details': response.text
                            }
                            
                except (requests.ConnectionError, requests.Timeout) as e:
                    logger.warning(f"Network error pushing ticket {ticket.ticket_id} (attempt {attempt + 1}): {str(e)}")
                    if attempt < self.max_retries:
                        time.sleep(self.retry_delay * (attempt + 1))  # Exponential backoff
                        continue
                    else:
                        return {
                            'success': False, 
                            'error': f'Network error after {self.max_retries + 1} attempts: {str(e)}',
                            'can_retry': True
                        }
                        
        except Ticket.DoesNotExist:
            logger.error(f"Ticket with id {ticket_id} not found")
            return {'success': False, 'error': 'Ticket not found'}
        except Exception as e:
            logger.error(f"Unexpected error pushing ticket {ticket_id}: {str(e)}")
            return {'success': False, 'error': f'Unexpected error: {str(e)}'}
    
    def push_multiple_tickets(self, ticket_ids):
        """Push multiple tickets to workflow service"""
        results = []
        for ticket_id in ticket_ids:
            result = self.push_ticket_to_workflow(ticket_id)
            result['ticket_id'] = ticket_id
            results.append(result)
        return results
    
    def check_workflow_health(self):
        """Check if workflow service is available"""
        try:
            response = self.session.get(
                f"{self.workflow_base_url}/workflow/tickets/health_check/",
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Workflow service health check failed: {str(e)}")
            return False