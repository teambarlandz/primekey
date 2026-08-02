import uuid

from django.db import models

from apps.crm.models import ConciergeLead
from apps.landlords.models import LandlordProfile


class WhatsAppThread(models.Model):
    """
    A WhatsApp conversation started against a lead or landlord contact.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, db_index=True)
    display_name = models.CharField(max_length=150, blank=True, default="")

    # Optional source records
    concierge_lead = models.OneToOneField(
        ConciergeLead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='whatsapp_thread',
    )
    landlord = models.OneToOneField(
        LandlordProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='whatsapp_thread',
    )

    last_message = models.TextField(blank=True, default="")
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_message_at', '-updated_at']
        verbose_name = "WhatsApp Thread"
        verbose_name_plural = "WhatsApp Threads"

    def __str__(self):
        return f"WhatsApp {self.display_name or self.phone}"


class WhatsAppMessage(models.Model):
    DIRECTION_CHOICES = [
        ('outbound', 'Outbound'),
        ('inbound', 'Inbound'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(
        WhatsAppThread,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='outbound')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "WhatsApp Message"
        verbose_name_plural = "WhatsApp Messages"

    def __str__(self):
        return f"{self.get_direction_display()}: {self.body[:40]}"
