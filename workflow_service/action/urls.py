from django.urls import path
from .views import *

urlpatterns = [
    path('create/', ActionCreateView.as_view(), name='action-create'),
    path('list/', ActionListView.as_view(), name='action-list')
]
