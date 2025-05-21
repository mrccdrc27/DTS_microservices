from django.urls import path
from . import views
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path('hello/', views.HelloView.as_view(), name='hello'),
    path('admin/', views.AdminView.as_view(), name='admin'),
    path('verify/', views.Verify.as_view(), name='admin'),

    path("register/", UserRegistrationAPIView.as_view(), name="register-user"),
    path("login/", UserLoginAPIView.as_view(), name="login-user"),
    path("logout/", UserLogoutAPIView.as_view(), name="logout-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("user/", UserInfoAPIView.as_view(), name="user-info"),

    path('password/reset/', RequestPasswordResetAPIView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),
    path('api/password/reset-complete/', PasswordResetCompleteAPIView.as_view(), name='password_reset_complete'),

    path('invite/', InviteUserView.as_view(), name='invite-user'),
    path('api/register/<uuid:token>/', RegisterUserView.as_view(), name='register-user'),
]