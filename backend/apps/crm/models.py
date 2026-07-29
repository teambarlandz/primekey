import uuid
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
    lead_score = models.IntegerField(default=0, verbose_name="Lead Score")
    sla_deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="SLA Deadline (2 hours from creation)"
    )
    assigned_agent = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads',
        verbose_name="Assigned Agent"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Concierge Lead"
        verbose_name_plural = "Concierge Leads"
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['sla_deadline', 'status']),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.preferred_location} ({self.phone})"

    def save(self, *args, **kwargs):
        if not self.sla_deadline and self.status == 'active_sla_queue':
            self.sla_deadline = timezone.now() + timedelta(hours=2)
        super().save(*args, **kwargs)

    @property
    def is_sla_breached(self):
        if self.sla_deadline and self.status in ['active_sla_queue', 'assigned']:
            return timezone.now() > self.sla_deadline
        return False

    @property
    def sla_remaining_minutes(self):
        if self.sla_deadline and self.status in ['active_sla_queue', 'assigned']:
            remaining = self.sla_deadline - timezone.now()
            return max(0, int(remaining.total_seconds() / 60))
        return 0


class LeadScore(models.Model):
    """
    Lead scoring breakdown for transparency and audit.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.OneToOneField(ConciergeLead, on_delete=models.CASCADE, related_name='score_breakdown')
    
    # Scoring factors (each 0-20 points)
    budget_match_score = models.IntegerField(default=0)
    location_match_score = models.IntegerField(default=0)
    property_type_match_score = models.IntegerField(default=0)
    bedrooms_match_score = models.IntegerField(default=0)
    completeness_score = models.IntegerField(default=0)
    urgency_score = models.IntegerField(default=0)
    
    total_score = models.IntegerField(default=0)
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Lead Score"
        verbose_name_plural = "Lead Scores"

    def __str__(self):
        return f"Score for {self.lead}: {self.total_score}"


class SLAAlert(models.Model):
    """
    SLA breach alerts for management notification.
    """
    SEVERITY_CHOICES = [
        ('warning', 'Warning (30 min remaining)'),
        ('breach', 'SLA Breached'),
        ('critical', 'Critical (1+ hour overdue)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(ConciergeLead, on_delete=models.CASCADE, related_name='sla_alerts')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    message = models.TextField()
    acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_sla_alerts'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "SLA Alert"
        verbose_name_plural = "SLA Alerts"
        indexes = [
            models.Index(fields=['lead', 'acknowledged']),
        ]

    def __str__(self):
        return f"{self.severity.upper()} - {self.lead.full_name}"


class ConsentLog(models.Model):
    """
    NDPR Compliance Audit Trail for lead consent capture.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(ConciergeLead, on_delete=models.CASCADE, related_name='consent_logs')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    consent_text = models.TextField(default="I consent to Primekey Homes processing my contact information under NDPR.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"NDPR Consent Log for Lead: {self.lead.id} at {self.created_at}"