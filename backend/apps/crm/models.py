import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta


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

    # Related listing (buyer inquiries from the property detail page)
    listing = models.ForeignKey(
        'properties.Property',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inquiries',
        verbose_name="Listing Inquired About",
    )
    inquiry_message = models.TextField(blank=True, verbose_name="Inquiry Message")

    # Lead Scoring & SLA
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_concierge_leads",
        verbose_name="Assigned Agent",
    )
    sla_deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="2-Hour SLA Deadline",
    )
    sla_breached_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="SLA Breach Timestamp",
    )

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

    @property
    def is_sla_breached(self) -> bool:
        return self.sla_breached_at is not None

    @property
    def sla_remaining_minutes(self) -> int | None:
        if not self.sla_deadline:
            return None
        remaining = self.sla_deadline - timezone.now()
        return max(0, int(remaining.total_seconds() // 60))

    def start_sla_clock(self):
        """Start the 2-hour SLA clock for a newly created, unassigned lead."""
        self.sla_deadline = timezone.now() + timedelta(hours=2)
        self.save(update_fields=["sla_deadline", "updated_at"])


class LeadScore(models.Model):
    """
    Persisted lead priority score with per-factor breakdown.
    Exposed to the compliance export as the lead's `score_breakdown`.
    """
    TIER_CHOICES = [
        ('HOT', 'Hot'),
        ('WARM', 'Warm'),
        ('COLD', 'Cold'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.OneToOneField(
        ConciergeLead,
        on_delete=models.CASCADE,
        related_name="score_breakdown",
    )

    budget_match_score = models.PositiveSmallIntegerField(default=0)
    location_match_score = models.PositiveSmallIntegerField(default=0)
    property_type_match_score = models.PositiveSmallIntegerField(default=0)
    bedrooms_match_score = models.PositiveSmallIntegerField(default=0)
    completeness_score = models.PositiveSmallIntegerField(default=0)
    urgency_score = models.PositiveSmallIntegerField(default=0)
    total_score = models.PositiveSmallIntegerField(default=0)
    tier = models.CharField(max_length=5, choices=TIER_CHOICES, default='COLD')
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lead Score"
        verbose_name_plural = "Lead Scores"

    def __str__(self):
        return f"{self.lead.full_name} - {self.tier} ({self.total_score})"


class SLAAlert(models.Model):
    """
    Records a 2-hour SLA breach for an unassigned concierge lead.
    Exposed to the compliance export as the lead's `sla_alerts`.
    """
    SEVERITY_CHOICES = [
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(
        ConciergeLead,
        on_delete=models.CASCADE,
        related_name="sla_alerts",
    )
    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
        default='warning',
    )
    message = models.TextField(blank=True, default="")
    acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "SLA Alert"
        verbose_name_plural = "SLA Alerts"

    def __str__(self):
        return f"{self.get_severity_display()} - {self.lead.full_name}"


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
