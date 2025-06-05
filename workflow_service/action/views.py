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

class ActionListCreateView(generics.ListCreateAPIView):
    queryset = Actions.objects.all()
    serializer_class = ActionRegister

    def get_queryset(self):
        action_id = self.request.query_params.get('id')
        if action_id:
            return Actions.objects.filter(action__id=action_id)
        return Actions.objects.all()