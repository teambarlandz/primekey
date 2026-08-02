import uuid

from django.conf import settings
from django.db import models


class AgentProfile(models.Model):
    ROLE_CHOICES = [
        ('agent', 'Agent'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='agent_profile',
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='agent')
    phone = models.CharField(max_length=20, unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Agent Profile"
        verbose_name_plural = "Agent Profiles"

    def __str__(self):
        return f"{self.full_name or self.phone} ({self.get_role_display()})"

    @property
    def can_manage(self) -> bool:
        return self.role in ('manager', 'admin')
