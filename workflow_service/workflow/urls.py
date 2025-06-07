from django.urls import path
from .views import (
    WorkflowListCreateView, WorkflowDetailView,
    StepListCreateView, StepDetailView,
    StepActionListCreateView, StepActionDetailView,
    StepTransitionListCreateView
)

urlpatterns = [
    path('workflows/', WorkflowListCreateView.as_view(), name='workflow-list-create'),
    path('workflows/<int:id>/', WorkflowDetailView.as_view(), name='workflow-detail'),

    path('steps/', StepListCreateView.as_view(), name='step-list-create'),
    path('steps/<int:id>/', StepDetailView.as_view(), name='step-detail'),

    path('step-actions/', StepActionListCreateView.as_view(), name='step-action-list-create'),
    path('step-actions/<int:id>/', StepActionDetailView.as_view(), name='step-action-detail'),

    path('step-transitions/', StepTransitionListCreateView.as_view(), name='step-transition-list-create'),
]
