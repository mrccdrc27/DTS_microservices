from django.db import models
from django.core.exceptions import ValidationError
import uuid

class Roles(models.Model):
    role_id = models.CharField(max_length=64, unique=True, null=True, blank=True)  # Unique identifier for the role
    # used to who creates the model
    # Must be unique
    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)

    # timestamps
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # Only enforce immutability on creation
            if not self.role_id:
                self.role_id = str(uuid.uuid4())  # Assign a unique identifier if missing
        else:
            if 'role_id' in kwargs.get('update_fields', []):
                raise ValidationError("role_id cannot be modified after creation.")  # Prevent updates

        super().save(*args, **kwargs)  # Save to database