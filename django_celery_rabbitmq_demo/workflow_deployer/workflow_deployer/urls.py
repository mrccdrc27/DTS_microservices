from django.contrib import admin
from django.urls import path
from deployer_app.views import deploy_workflow

urlpatterns = [
    path('admin/', admin.site.urls),
    path('deploy/', deploy_workflow),
]
