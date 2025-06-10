from django.db import models

class Actions(models.Model):
    
    # revise not to be unique, as actions with similar name can be reused across workflows
    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Create your models here.
