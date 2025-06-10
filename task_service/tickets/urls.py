# workflow_service/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowTicketViewSet

router = DefaultRouter()
router.register(r'tickets', WorkflowTicketViewSet)

urlpatterns = [
    path('', include(router.urls)),
]