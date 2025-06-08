import requests
from django.conf import settings
from django.utils import timezone
from .models import Ticket, TicketPushQueue
from .serializers import TicketPushSerializer
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
import traceback
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

logger = logging.getLogger(__name__)

class WorkflowPushService:
    def __init__(self):
        self.workflow_base_url = 'http://localhost:2000'
        self.timeout = getattr(settings, 'WORKFLOW_SERVICE_TIMEOUT', 0.1)

        # Retry strategy for GET/HEAD/OPTIONS (health checks)
        retry_strategy_get = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS"],
        )
        # Retry strategy for POST: no retries to avoid long backoff on writes
        retry_strategy_post = Retry(
            total=0,
            backoff_factor=0,
            status_forcelist=[],
            allowed_methods=["POST"],
        )

        adapter_get = HTTPAdapter(max_retries=retry_strategy_get)
        adapter_post = HTTPAdapter(max_retries=retry_strategy_post)

        self.session = requests.Session()
        self.session.mount("http://", adapter_get)
        self.session.mount("https://", adapter_get)
        # Mount POST adapter specifically for POST requests
        self.session.mount("http://", adapter_post)
        self.session.mount("https://", adapter_post)

    @lru_cache(maxsize=1)
    def is_workflow_online_cached(self):
        try:
            self.session.get(self.workflow_base_url, timeout=self.timeout)
            return True
        except Exception:
            return False

    def clear_workflow_online_cache(self):
        self.is_workflow_online_cached.cache_clear()

    def push_ticket_to_workflow(self, ticket_id):
        try:
            if not self.is_workflow_online_cached():
                logger.warning(f"Workflow system offline. Queuing ticket_id={ticket_id} before DB lookup.")
                self.enqueue_ticket_id(ticket_id, "Workflow system offline (early check)")
                return {'success': False, 'error': 'System offline, queued'}

            ticket = Ticket.objects.get(id=ticket_id)

            if ticket.pushed_to_workflow:
                logger.info(f"Ticket {ticket.ticket_id} already pushed.")
                return {'success': True, 'message': 'Already pushed'}

            serializer = TicketPushSerializer(ticket)
            ticket_data = serializer.data
            ticket_data.update({
                'original_ticket_id': ticket.ticket_id,
                'source_service': 'ticket_service'
            })

            response = self.session.post(
                f"{self.workflow_base_url}/workflow/tickets/",
                json=ticket_data,
                headers={'Content-Type': 'application/json'},
                timeout=self.timeout
            )

            if response.status_code in [200, 201]:
                data = response.json()
                ticket.pushed_to_workflow = True
                ticket.workflow_ticket_id = data.get('id') or data.get('ticket_id')
                ticket.workflow_push_at = timezone.now()
                ticket.save()
                logger.info(f"Successfully pushed ticket {ticket.ticket_id}")
                return {'success': True, 'workflow_id': ticket.workflow_ticket_id}

            logger.warning(f"Workflow returned {response.status_code}: {response.text}")
            self.enqueue_ticket(ticket, f"HTTP {response.status_code}: {response.text}")
            return {'success': False, 'error': f"HTTP {response.status_code}"}

        except (requests.ConnectionError, requests.Timeout) as e:
            logger.warning(f"Network error for ticket {ticket_id}: {e}")
            self.enqueue_ticket_id(ticket_id, f"Network error: {e}")
            return {'success': False, 'error': str(e)}

        except Ticket.DoesNotExist:
            logger.error(f"Ticket with ID {ticket_id} does not exist.")
            return {'success': False, 'error': 'Ticket not found'}

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            traceback.print_exc()
            self.enqueue_ticket_id(ticket_id, f"Unexpected: {e}")
            return {'success': False, 'error': str(e)}

    def enqueue_ticket(self, ticket, error=''):
        TicketPushQueue.objects.update_or_create(
            ticket=ticket,
            defaults={
                'status': 'pending',
                'retry_': 0,
                'last_error': error,
                'scheduled_for': timezone.now()
            }
        )
        logger.info(f"Ticket {ticket.ticket_id} added to retry queue.")

    def enqueue_ticket_id(self, ticket_id, error=''):
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            self.enqueue_ticket(ticket, error)
        except Ticket.DoesNotExist:
            logger.error(f"Failed to enqueue: ticket {ticket_id} does not exist.")

    def process_retry_queue(self):
        now = timezone.now()

        # Get all queue items pending or failed and scheduled for now or earlier
        queue_items = TicketPushQueue.objects.filter(
            status__in=['pending', 'failed']
        ).filter(
            scheduled_for__lte=now
        )

        processed = []

        # Clear health check cache once before batch
        self.clear_workflow_online_cache()

        for item in queue_items.select_related('ticket'):
            try:
                item.status = 'processing'
                item.save()

                result = self.push_ticket_to_workflow(item.ticket.id)

                if result['success']:
                    item.status = 'completed'
                    item.ticket.pushed_to_workflow = True
                    item.ticket.workflow_push_at = timezone.now()
                    item.ticket.save()
                else:
                    item.retry_ += 1
                    item.last_error = result.get('error', 'Unknown error')
                    item.status = 'failed' if item.retry_ >= item.max_retries else 'pending'
                    item.scheduled_for = now + timezone.timedelta(minutes=5)

                item.save()
                processed.append({'ticket_id': item.ticket.ticket_id, 'result': item.status})

            except Exception:
                item.retry_ += 1
                item.last_error = traceback.format_exc()
                item.status = 'failed' if item.retry_ >= item.max_retries else 'pending'
                item.scheduled_for = now + timezone.timedelta(minutes=10)
                item.save()
                processed.append({'ticket_id': item.ticket.ticket_id, 'result': 'exception'})

        return processed

    def push_multiple_tickets(self, ticket_ids):
        results = []

        # Clear health check cache once before batch
        self.clear_workflow_online_cache()

        def push_one(ticket_id):
            return {**self.push_ticket_to_workflow(ticket_id), 'ticket_id': ticket_id}

        with ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(push_one, ticket_ids))

        return results
