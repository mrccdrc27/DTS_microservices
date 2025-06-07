from django.db import models
from django.core.exceptions import ValidationError

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
    userID        = models.IntegerField(null=False)
    workflowName  = models.CharField(max_length=64, unique=True)
    description   = models.CharField(max_length=256, null=True)

    mainCategory = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='main_workflows',
        limit_choices_to={'parent__isnull': True},   # <-- only root cats
    )
    subCategory = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='sub_workflows',
        limit_choices_to={'parent__isnull': False},  # <-- only subcats
    )

    status        = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")
    createdAt     = models.DateTimeField(auto_now_add=True)
    updatedAt     = models.DateTimeField(auto_now=True)
    isInitialized = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['mainCategory', 'subCategory'],
                name='unique_main_sub_per_workflow'
            ),
        ]

    def clean(self):
        # Enforce mainCategory.parent is None
        if self.mainCategory and self.mainCategory.parent is not None:
            raise ValidationError({
                'mainCategory': 'Must be a top-level category (parent is null).'
            })

        # Enforce subCategory.parent is not None
        if self.subCategory and self.subCategory.parent is None:
            raise ValidationError({
                'subCategory': 'Must be a sub-category (parent is not null).'
            })

    def save(self, *args, **kwargs):
        # run clean() so ValidationError bubbles up on save()
        self.full_clean()
        super().save(*args, **kwargs)