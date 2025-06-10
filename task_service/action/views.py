from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *

# Create your views here.
class ActionListCreateView(generics.ListCreateAPIView):
    serializer_class = ActionRegister

    def get_queryset(self):
        action_id = self.request.query_params.get('id')
        if action_id:
            return Actions.objects.filter(id=action_id)
        return Actions.objects.all()

class ActionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Actions.objects.all()
    serializer_class = ActionRegister
    lookup_field = 'id'