import uuid
from django.db import models


class ConciergeLead(models.Model):
    """
    Tracks leads generated from the 2-Week Concierge matching service
    when user searches return empty results.
    """

    STATUS_CHOICES = [
        ("new", "New"),
        ("assigned", "Assigned"),
        ("contacted", "Contacted"),
        ("tour_scheduled", "Tour Scheduled"),
        ("closed_won", "Closed Won"),
        ("closed_lost", "Closed Lost"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(
        max_length=20
    )  # Standardized Nigerian format (+234/080...)
    email = models.EmailField(blank=True, null=True)
    preferred_location = models.CharField(max_length=150)
    property_type = models.CharField(max_length=50)
    budget_min = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2)
    bedrooms = models.CharField(max_length=20, default="any")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    lead_score = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "concierge_leads"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} - {self.preferred_location} ({self.property_type})"


class ConsentLog(models.Model):
    """
    Immutable audit log for NDPR data processing consent tracking.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(
        ConciergeLead,
        on_delete=models.CASCADE,
        related_name="consent_logs",
        null=True,
        blank=True,
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    consent_given = models.BooleanField(default=False)
    terms_version = models.CharField(max_length=20, default="1.0")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "consent_logs"
        ordering = ["-created_at"]

    def __str__(self):
        status = "Granted" if self.consent_given else "Denied"
        return f"NDPR Consent {status} - {self.created_at}"


class LeadScore(models.Model):
    """
    Tracks scoring parameters and SLA tracking metadata for incoming leads.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.OneToOneField(
        ConciergeLead, on_delete=models.CASCADE, related_name="scoring_details"
    )
    budget_score = models.IntegerField(default=0)
    timeline_score = models.IntegerField(default=0)
    completeness_score = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    sla_breached = models.BooleanField(default=False)
    alert_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lead_scores"

    def __str__(self):
        return f"Score: {self.total_score} for Lead {self.lead_id}"
