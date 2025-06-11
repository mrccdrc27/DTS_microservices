from rest_framework import generics
from rest_framework.generics import RetrieveAPIView
from rest_framework.exceptions import ValidationError
from .models import Workflows
from .serializers import *

class WorkflowListCreateView(generics.ListCreateAPIView):
    queryset = Workflows.objects.all()
    serializer_class = WorkflowSerializer

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

class WorkflowAggregatedView(generics.ListAPIView):
    serializer_class = FullWorkflowSerializer
    queryset = Workflows.objects.all()

class WorkflowAggregatedDetailView(RetrieveAPIView):
    queryset = Workflows.objects.all()
    serializer_class = FullWorkflowSerializer
    lookup_field = 'id'


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.workflow_commit_service import commit_workflow_json

class WorkflowSyncView(APIView):
    def post(self, request):
        data = request.data
        source_server = request.headers.get('X-Source-Server')  # Or some other way to identify it
        result = commit_workflow_json(data)

        # if isinstance(data, list):
        #     result = bulk_commit_workflows(data, source_server)
        # else:
        #     result = commit_workflow_json(data, source_server)

        return Response(result, status=status.HTTP_200_OK if result.get('success', True) else status.HTTP_400_BAD_REQUEST)
