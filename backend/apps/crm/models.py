import uuid
from django.db import models


class ConciergeLead(models.Model):
    PROPERTY_TYPES = [
        ('any', 'Any Property Type'),
        ('flat_apartment', 'Flat / Apartment'),
        ('house_duplex', 'House / Duplex'),
        ('land', 'Land'),
        ('commercial', 'Commercial Space'),
    ]

    STATUS_CHOICES = [
        ('active_sla_queue', 'Active SLA Queue'),
        ('assigned', 'Assigned to Agent'),
        ('contacted', 'Contacted'),
        ('closed_won', 'Closed (Matched)'),
        ('closed_lost', 'Closed (Unmatched)'),
        ('erased_ndpr', 'Erased / Closed (NDPR Request)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Contact Information
    full_name = models.CharField(max_length=150, verbose_name="Full Name")
    phone = models.CharField(max_length=20, db_index=True, verbose_name="Phone Number")
    email = models.EmailField(blank=True, null=True, verbose_name="Email Address")

    # Property Sourcing Preferences
    preferred_location = models.CharField(max_length=255, verbose_name="Target Location")
    property_type = models.CharField(
        max_length=50,
        choices=PROPERTY_TYPES,
        default='any'
    )
    budget_min = models.BigIntegerField(default=0, verbose_name="Min Budget (NGN)")
    budget_max = models.BigIntegerField(default=500000000, verbose_name="Max Budget (NGN)")
    bedrooms = models.CharField(
        max_length=20,
        default='any',
        verbose_name="Bedrooms"
    )

    # Legal & NDPR Compliance
    ndpr_consent = models.BooleanField(
        default=False,
        verbose_name="NDPR Privacy Consent Given"
    )
    consent_timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="NDPR Consent Timestamp"
    )

    # Lead Tracking & SLA Management
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='active_sla_queue',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Concierge Lead"
        verbose_name_plural = "Concierge Leads"
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.preferred_location} ({self.phone})"


class ConsentLog(models.Model):
    """
    NDPR Compliance Audit Trail for lead consent capture & data erasure events.
    """
    ACTION_CHOICES = [
        ('CONSENT_GIVEN', 'Consent Given'),
        ('CONSENT_REVOKED', 'Consent Revoked'),
        ('ERASURE_REQUESTED', 'Erasure Requested'),
        ('ERASURE_COMPLETED', 'Erasure Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(
        ConciergeLead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consent_logs'
    )
    phone = models.CharField(max_length=20, db_index=True, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES, default='CONSENT_GIVEN')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    consent_text = models.TextField(default="I consent to Primekey Homes processing my contact information under NDPR.")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crm_consent_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"NDPR Audit Log [{self.action}] - Phone: {self.phone or 'N/A'} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
