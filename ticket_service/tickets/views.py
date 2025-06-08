from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Ticket, TicketPushQueue
from .serializers import TicketSerializer, TicketPushQueueSerializer
from .services import WorkflowPushService

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.workflow_service = WorkflowPushService()
    
    @action(detail=True, methods=['post'])
    def push_to_workflow(self, request, pk=None):
        """Push a single ticket to workflow service"""
        ticket = get_object_or_404(Ticket, pk=pk)
        result = self.workflow_service.push_ticket_to_workflow(ticket.id)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def push_multiple_to_workflow(self, request):
        """Push multiple tickets to workflow service"""
        ticket_ids = request.data.get('ticket_ids', [])
        
        if not ticket_ids:
            return Response(
                {'error': 'ticket_ids list is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = self.workflow_service.push_multiple_tickets(ticket_ids)
        return Response({'results': results}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def push_unpushed_to_workflow(self, request):
        """Push all unpushed tickets to workflow service"""
        unpushed_tickets = Ticket.objects.filter(pushed_to_workflow=False)
        ticket_ids = list(unpushed_tickets.values_list('id', flat=True))
        
        if not ticket_ids:
            return Response(
                {'message': 'No unpushed tickets found'}, 
                status=status.HTTP_200_OK
            )
        
        results = self.workflow_service.push_multiple_tickets(ticket_ids)
        return Response({
            'message': f'Processed {len(ticket_ids)} tickets',
            'results': results
        }, status=status.HTTP_200_OK)