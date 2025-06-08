from django.db import models

class Actions(models.Model):
    actionName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

# Create your models here.
