from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HistoryLogViewSet

router = DefaultRouter()
router.register(r'historylogs', HistoryLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
