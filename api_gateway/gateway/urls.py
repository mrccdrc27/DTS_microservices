from django.urls import path
from .views import TicketListView, TicketDetailView

urlpatterns = [
    path('tickets/', TicketListView.as_view()),
    path('tickets/<str:ticket_id>/', TicketDetailView.as_view()),
]
