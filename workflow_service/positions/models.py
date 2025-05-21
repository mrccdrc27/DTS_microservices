from django.db import models

class Positions(models.Model):
    # used to who creates the model
    userID = models.IntegerField(null=False)
    # Must be unique
    positionName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
