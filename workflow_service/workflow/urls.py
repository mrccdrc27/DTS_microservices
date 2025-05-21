from django.urls import path
from .views import *

urlpatterns = [
    path('create/', WorkflowCreateView.as_view(), name='workflow-create'),
    path('create/step', StepCreateView.as_view(), name='step-create'),
    path('create/stepaction', StepActionCreateView.as_view(), name='stepaction-create'),
    path('list/', WorkflowListView.as_view(), name='workflow-list'),
    path('list/step', StepListView.as_view(), name='step-list'),
    path('list/stepaction', StepActionListView.as_view(), name='stepaction-list'),
]