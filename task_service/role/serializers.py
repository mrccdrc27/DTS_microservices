from .models import Positions
from rest_framework import serializers
from django.contrib.auth import authenticate

#display class?
class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Positions
        fields = ("id", "positionName", "description")

class PositionRegister(serializers.ModelSerializer):
    class Meta:
        model = Positions
        fields = (
            "id",
            "userID",
            "positionName",
            "description"
        )
    
    # Validation logic

    def validate(self, attrs):
        name = attrs.get("positionName") 
        if len(name) < 8:
            raise serializers.ValidationError(
                "name must be greater than 8 characters"
            )
        return attrs
    
    # Create the model
    def create(self, validated_data):
        return Positions.objects.create(**validated_data)