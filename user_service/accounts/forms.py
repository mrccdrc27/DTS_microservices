from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm):
        model = CustomUser
        fields = ("email",)

class CustomUserChangeForm(UserCreationForm):
    class Meta(UserCreationForm):
        model = CustomUser
        fields = ("email",)