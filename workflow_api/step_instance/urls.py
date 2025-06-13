from django.urls import path
from .views import TriggerNextStepView, AvailableActionsView, StepInstanceView

urlpatterns = [
    path('<str:step_instance_id>/actions/', AvailableActionsView.as_view()),
    # path('<str:step_instance_id>/', TriggerNextStepView.as_view()),
    path('<uuid:step_instance_id>/', TriggerNextStepView.as_view()),
    path('list/', StepInstanceView.as_view()),
]
