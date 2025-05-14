from django.urls import path
from .views import *

urlpatterns = [
    path('create/', PositionCreateView.as_view(), name='position-create'),
    path('list/', PositionListView.as_view(), name='position-list'),  # optional
]
