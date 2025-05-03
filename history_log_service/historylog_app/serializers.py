from rest_framework import serializers
from .models import HistoryLog

class HistoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryLog
        fields = '__all__'
