from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializer
from .tasks import notify_ticket_created, send_to_workflow

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-opened_on')
    serializer_class = TicketSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        
        # Trigger async tasks
        notify_ticket_created.delay(ticket.ticket_id)
        
        ticket_data = {
            'ticket_id': ticket.ticket_id,
            'subject': ticket.subject,
            'priority': ticket.priority,
            'status': ticket.status,
        }
        send_to_workflow.delay(ticket_data)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)