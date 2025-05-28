from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
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

    def is_expired(self):
        return timezone.now() > self.expires_at