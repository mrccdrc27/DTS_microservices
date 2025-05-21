from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *
from rest_framework.exceptions import ValidationError

class WorkflowCreateView(generics.CreateAPIView):
    queryset = Workflows.objects.all()
    serializer_class = WorkflowRegister

class WorkflowListView(generics.ListAPIView):
    queryset = Workflows.objects.all()
    serializer_class = WorkflowSerializer

class StepCreateView(generics.CreateAPIView):
    queryset = Steps.objects.all()
    serializer_class = StepRegister
class StepListView(generics.ListAPIView):
    serializer_class = StepSerializer
    
    # Creates parameter named workflow
    def get_queryset(self):
        workflow_id = self.request.query_params.get("workflow", None)
        if workflow_id:
            try:
                workflow_id = int(workflow_id)
            except ValueError:
                raise ValidationError({"error": "Invalid Parameters"})
            return Steps.objects.filter(workflow__id=workflow_id)
        return Steps.objects.all()  # Return all if no filter is applied

class StepActionListView(generics.ListAPIView):
    serializer_class = StepActionsSerializer

    def get_queryset(self):
        step_id = self.request.query_params.get("step", None)
        if step_id:
            try:
                step_id = int(step_id)
            except ValueError:
                raise ValidationError({"error": "Invalid Parameters"})
            return StepActions.objects.filter(step__id=step_id)
        return StepActions.objects.all()  # Return all if no filter is applied

class StepActionCreateView(generics.CreateAPIView):
    queryset = StepActions.objects.all()
    serializer_class = StepActionRegisterSerializer