from django.db import models
from django.core.exceptions import ValidationError
import uuid

class Actions(models.Model):
    
    # revise not to be unique, as actions with similar name can be reused across workflows
    action_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # Only enforce immutability on creation
            if not self.action_id:
                self.action_id = str(uuid.uuid4())  # Assign a unique identifier if missing
        else:
            if 'action_id' in kwargs.get('update_fields', []):
                raise ValidationError("action_id cannot be modified after creation.")  # Prevent updates
            super().save(*args, **kwargs)  # Save to database


# Create your models here.
