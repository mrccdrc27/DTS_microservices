from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .models import Workflows, Steps, StepActions
from .serializers import *


# --- WORKFLOWS ---
class WorkflowListCreateView(generics.ListCreateAPIView):
    queryset = Workflows.objects.all()
    serializer_class = WorkflowSerializer2

    def get_queryset(self):
        workflow_id = self.request.query_params.get('id')
        if workflow_id:
            return Workflows.objects.filter(id=workflow_id)
        return Workflows.objects.all()


class WorkflowDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Workflows.objects.all()
    serializer_class = WorkflowSerializer
    lookup_field = 'id'

from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# --- STEPS ---
class StepListCreateView(generics.ListCreateAPIView):
    queryset = Steps.objects.all()
    serializer_class = StepSerializer

    def get_queryset(self):
        workflow_id = self.request.query_params.get('workflow')
        if workflow_id:
            return Steps.objects.filter(workflow__id=workflow_id)
        return Steps.objects.all()
class StepTransitionListCreateView(generics.ListCreateAPIView):
    queryset = StepTransition.objects.all()
    serializer_class = StepTransitionSerializer

    def get_queryset(self):
        step_id = self.request.query_params.get("step", None)
        if step_id:
            try:
                step_id = int(step_id)
            except ValueError:
                raise ValidationError({"error": "Invalid Parameters"})
            return StepTransition.objects.filter(from_step__id=step_id)
        return StepTransition.objects.all()

class StepDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Steps.objects.all()
    serializer_class = StepSerializer
    lookup_field = 'id'


# --- STEP ACTIONS ---
class StepActionListCreateView(generics.ListCreateAPIView):
    queryset = StepActions.objects.all()
    serializer_class = StepActionsSerializer

    def get_queryset(self):
        step_id = self.request.query_params.get("step", None)
        if step_id:
            try:
                step_id = int(step_id)
            except ValueError:
                raise ValidationError({"error": "Invalid Parameters"})
            return StepActions.objects.filter(step__id=step_id)
        return StepActions.objects.all()


class StepActionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StepActions.objects.all()
    serializer_class = StepActionsSerializer
    lookup_field = 'id'
