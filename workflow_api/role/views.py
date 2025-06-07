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
class PositionListCreateView(generics.ListCreateAPIView):
    serializer_class = PositionRegister

    def get_queryset(self):
        position_id = self.request.query_params.get('id')
        if position_id:
            return Positions.objects.filter(id=position_id)
        return Positions.objects.all()
    
class PositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Positions.objects.all()
    serializer_class = PositionRegister
    lookup_field = 'id'