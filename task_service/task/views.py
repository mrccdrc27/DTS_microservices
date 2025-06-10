from django.shortcuts import render
from rest_framework import generics
from .serializers import TaskSerializer
from .models import Task

class TaskListView(generics.ListAPIView):
    """
    API view to list all tasks.
    """
    serializer_class = TaskSerializer
    queryset = Task.objects.all()  # Explicitly defining queryset

    def get_queryset(self):
        """
        Optionally restricts the returned tasks to a given user,
        by filtering against a `user_id` query parameter in the URL.
        """
        user_id = self.request.query_params.get('user_id', None)
        if user_id is not None:
            return self.queryset.filter(user_id=user_id)
        return self.queryset