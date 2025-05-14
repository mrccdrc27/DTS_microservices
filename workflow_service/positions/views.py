from django.shortcuts import render
from rest_framework import generics
from .models import Positions
from .serializers import PositionRegister

# Create new position
class PositionCreateView(generics.CreateAPIView):
    queryset = Positions.objects.all()
    serializer_class = PositionRegister

# Optionally list all positions
class PositionListView(generics.ListAPIView):
    queryset = Positions.objects.all()
    serializer_class = PositionRegister
