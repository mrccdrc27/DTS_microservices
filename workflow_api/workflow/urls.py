from django.urls import path
from .views import *

urlpatterns = [
    path('workflows/', WorkflowListCreateView.as_view(), name='workflow-list-create'),
    path('workflows/<int:id>/', WorkflowDetailView.as_view(), name='workflow-detail'),

    path('categories/', CategoryListCreateView.as_view(), name='step-list-create'),
]
