from django.urls import path
from .views import *

urlpatterns = [
    path('', PositionListCreateView.as_view(), name='position-list-create'),
    path('<int:id>/', PositionDetailView.as_view(), name='position-detail-view'),
]
