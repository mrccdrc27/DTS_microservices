from rest_framework import serializers
from .models import StepInstance

class StepInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepInstance
        fields = '__all__'