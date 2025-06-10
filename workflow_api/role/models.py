from django.db import models

class Roles(models.Model):
    # used to who creates the model
    user_id = models.IntegerField(null=False)
    # Must be unique
    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)

    # timestamps
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
