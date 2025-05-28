from rest_framework import viewsets
from .models import Ticket
from .serializers import TicketSerializer
from .utils.redis_client import publish_ticket_created

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-opened_on')
    serializer_class = TicketSerializer


    def perform_create(self, serializer):
        ticket = serializer.save()
        # Publish only the ID
        publish_ticket_created(ticket.id)
