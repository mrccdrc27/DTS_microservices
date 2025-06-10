from django.db import models
from django.core.exceptions import ValidationError
import uuid


STATUS_CHOICES = [
    ("draft", "Draft"),
    ("deployed", "Deployed"),
    ("paused", "Paused"),
    ("initialized", "Initialized"),
]

class Category(models.Model):
    category_id = models.CharField(max_length=64, unique=True, null=True, blank=True)  # Unique identifier for the category
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
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only enforce immutability on creation
            if not self.category_id:
                self.category_id = str(uuid.uuid4())  # Assign a unique identifier if missing
        else:
            if 'category_id' in kwargs.get('update_fields', []):
                raise ValidationError("category_id cannot be modified after creation.")  # Prevent updates

        super().save(*args, **kwargs)  # Save to database


class Workflows(models.Model):
    user_id        = models.IntegerField(null=False)
    name  = models.CharField(max_length=64, unique=True)
    description   = models.CharField(max_length=256, null=True)
    workflow_id = models.CharField(max_length=64, unique=True, null=True, blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='main_workflows',
        limit_choices_to={'parent__isnull': True},   # <-- only root cats
    )
    sub_category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='sub_workflows',
        limit_choices_to={'parent__isnull': False},  # <-- only subcats
    )

    # timestamp fields
    status        = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")
    createdAt     = models.DateTimeField(auto_now_add=True)
    updatedAt     = models.DateTimeField(auto_now=True)

    # is_initialized = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['category', 'sub_category'],
                name='unique_main_sub_per_workflow'
            ),
        ]

    def clean(self):
        # Enforce category.parent is None
        if self.category and self.category.parent is not None:
            raise ValidationError({
                'category': 'Must be a top-level category (parent is null).'
            })

        # Enforce sub_category.parent is not None
        if self.sub_category and self.sub_category.parent is None:
            raise ValidationError({
                'sub_category': 'Must be aa sub-category (parent is not null).'
            })

    def save(self, *args, **kwargs):
        if not self.pk:  # Only enforce immutability on creation
            if not self.workflow_id:
                self.workflow_id = str(uuid.uuid4())  # Assign a unique identifier if missing
        else:
            if 'workflow_id' in kwargs.get('update_fields', []):
                raise ValidationError("workflow_id cannot be modified after creation.")  # Prevent updates

        self.full_clean()  # Validate model fields
        super().save(*args, **kwargs)  # Save to database

