from django.shortcuts import render
from rest_framework import viewsets
from .models import HistoryLog
from .serializers import HistoryLogSerializer

class HistoryLogViewSet(viewsets.ModelViewSet):
    queryset = HistoryLog.objects.all().order_by('-timestamp')
    serializer_class = HistoryLogSerializer

