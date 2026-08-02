import uuid
from django.db import models


class Notification(models.Model):
    RECIPIENT_TYPES = [
        ('landlord', 'Landlord'),
        ('agent', 'Agent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPES, db_index=True)
    recipient_id = models.UUIDField(null=True, blank=True, db_index=True)
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.recipient_type}:{self.recipient_id} - {self.title}"
