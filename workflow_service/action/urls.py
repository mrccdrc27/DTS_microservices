from django.urls import path
from .views import *

urlpatterns = [
    path('', ActionListCreateView.as_view(), name='action-list-create'),    
]
