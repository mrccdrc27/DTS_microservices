"""
URL configuration for user_service project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin default
    path('admin/', admin.site.urls),

    # this issues Access JWT token 
    path('api/token',
         jwt_views.TokenObtainPairView.as_view(),
         name='token_obtain_pair'),

    # this issues refresh JWT token 
    path('api/token/refresh/',
         jwt_views.TokenRefreshView.as_view(),
         name = 'token_refresh'),

    # this route takes all from accounts/urls.py under the /api endpoint
    path("api/", include("accounts.urls")),
    path("api/auth", include("accounts.urls")),
     path('reset-password/<uidb64>/<token>/', views.PasswordTokenCheckAPI.as_view(), name='password-reset-confirm'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)