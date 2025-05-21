from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *

# Create your views here.

class ActionCreateView(generics.CreateAPIView):
    queryset = Actions.objects.all()
    serializer_class = ActionRegister

class ActionListView(generics.ListAPIView):
    queryset = Actions.objects.all()
    serializer_class = ActionSerializer
