from django.urls import path
from .views import *

urlpatterns = [
    path('', ActionListCreateView.as_view(), name='action-list-create'),    
    path('<int:id>/', ActionDetailView.as_view(), name='action-detail'),
]
