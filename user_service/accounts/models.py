from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


class CustomUser(AbstractUser):
    middle_name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=False)
    profile_picture = models.FileField(upload_to='profile_pictures/', blank=True, null=True)
    role = models.CharField(max_length=20,blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self) -> str:
        return self.email

class PendingRegistration(models.Model):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def is_expired(self):
        return timezone.now() > self.expires_at