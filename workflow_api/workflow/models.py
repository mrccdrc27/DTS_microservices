from django.db import models

STATUS_CHOICES = [
    ("draft", "Draft"),
    ("deployed", "Deployed"),
    ("paused", "Paused"),
    ("initialized", "Initialized"),
]

class Category(models.Model):
    name = models.CharField(max_length=64, unique=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='subcategories',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class Workflows(models.Model):
    userID = models.IntegerField(null=False)
    workflowName = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=256, null=True)

    # Use category references
    mainCategory = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='main_workflows'
    )
    subCategory = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='sub_workflows'
    )

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    isInitialized = models.BooleanField(default=False)