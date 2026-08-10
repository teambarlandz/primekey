import uuid
import hashlib
import json
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.db.models import Q


class ConsentLog(models.Model):
    """
    Centralized consent log for NDPR compliance.
    Records all consent interactions across the platform.
    """
    PURPOSE_CHOICES = [
        ('concierge_sourcing', 'Concierge Property Sourcing'),
        ('marketing_emails', 'Marketing Communications'),
        ('sms_notifications', 'SMS Notifications'),
        ('property_alerts', 'Property Alert Emails'),
        ('data_analytics', 'Usage Analytics'),
        ('third_party_sharing', 'Third Party Data Sharing'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Subject identification (email OR phone, at least one required)
    email = models.EmailField(blank=True, null=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    
    # Consent details
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES, db_index=True)
    consent_given = models.BooleanField(default=False)
    consent_text = models.TextField()
    version = models.CharField(max_length=20, default='1.0')
    
    # Legal basis
    legal_basis = models.CharField(
        max_length=50,
        choices=[
            ('consent', 'Consent (Art 6(1)(a))'),
            ('contract', 'Contract Performance (Art 6(1)(b))'),
            ('legal_obligation', 'Legal Obligation (Art 6(1)(c))'),
            ('vital_interests', 'Vital Interests (Art 6(1)(d))'),
            ('public_task', 'Public Task (Art 6(1)(e))'),
            ('legitimate_interests', 'Legitimate Interests (Art 6(1)(f))'),
        ],
        default='consent'
    )
    
    # Context
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    referrer = models.URLField(blank=True, null=True)
    
    # Withdrawal
    withdrawn = models.BooleanField(default=False)
    withdrawn_at = models.DateTimeField(blank=True, null=True)
    withdrawal_method = models.CharField(max_length=50, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Consent Log'
        verbose_name_plural = 'Consent Logs'
        indexes = [
            models.Index(fields=['email', 'purpose']),
            models.Index(fields=['phone', 'purpose']),
        ]
    
    def __str__(self):
        identifier = self.email or self.phone
        status = "Given" if self.consent_given else "Denied"
        if self.withdrawn:
            status = "Withdrawn"
        return f"{identifier} - {self.get_purpose_display()} - {status}"


class ExportRequest(models.Model):
    """
    Data Subject Access Request (NDPR Art 27 / GDPR Art 15).
    User requests copy of all personal data held.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified - Processing'),
        ('processing', 'Compiling Data'),
        ('completed', 'Ready for Download'),
        ('failed', 'Failed'),
        ('expired', 'Download Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Subject identification
    email = models.EmailField(blank=True, null=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    
    # Request details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    include_metadata = models.BooleanField(
        default=False,
        help_text="Include IP addresses, user agents, timestamps"
    )
    reason = models.TextField(blank=True, null=True)
    
    # Verification
    verification_code = models.CharField(max_length=64, blank=True, null=True, help_text="SHA-256 hash of the 6-digit code")
    verification_sent_at = models.DateTimeField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    verification_attempts = models.IntegerField(default=0)
    
    # Output
    download_url = models.URLField(blank=True, null=True)
    records_count = models.IntegerField(default=0)
    expires_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Errors
    errors = models.JSONField(default=list, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Data Export Request'
        verbose_name_plural = 'Data Export Requests'
    
    def __str__(self):
        identifier = self.email or self.phone
        return f"Export Request - {identifier} - {self.status}"


class ErasureRequest(models.Model):
    """
    Right to Erasure / Right to be Forgotten (NDPR Art 28 / GDPR Art 17).
    User requests deletion/anonymization of personal data.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified - Processing'),
        ('processing', 'Anonymizing Data'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected (Legal Hold)'),
    ]
    
    REJECTION_REASONS = [
        ('legal_obligation', 'Legal Retention Requirement'),
        ('legal_claims', 'Active Legal Proceedings'),
        ('public_interest', 'Public Interest'),
        ('freedom_expression', 'Freedom of Expression'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Subject identification
    email = models.EmailField(blank=True, null=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    
    # Request details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    reason = models.TextField(blank=True, null=True)
    
    # Verification
    verification_code = models.CharField(max_length=64, blank=True, null=True, help_text="SHA-256 hash of the 6-digit code")
    verification_sent_at = models.DateTimeField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    verification_attempts = models.IntegerField(default=0)
    
    # Results
    records_erased = models.JSONField(default=dict, blank=True)
    rejected = models.BooleanField(default=False)
    rejection_reason = models.CharField(max_length=50, choices=REJECTION_REASONS, blank=True, null=True)
    
    # Errors
    errors = models.JSONField(default=list, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Data Erasure Request'
        verbose_name_plural = 'Data Erasure Requests'
    
    def __str__(self):
        identifier = self.email or self.phone
        return f"Erasure Request - {identifier} - {self.status}"


class AnonymizationLog(models.Model):
    """
    Immutable audit log of all anonymization events.
    Required for NDPR accountability principle.
    """
    TRIGGER_CHOICES = [
        ('erasure_request', 'User Erasure Request'),
        ('retention_policy', 'Automated Retention Policy (6 months)'),
        ('admin_action', 'Admin Manual Anonymization'),
        ('sla_breach', 'SLA Breach Cleanup'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Reference to original lead
    lead_id = models.UUIDField(db_index=True)
    lead_phone = models.CharField(max_length=20, db_index=True)
    lead_email = models.EmailField(blank=True, null=True, db_index=True)
    
    # What was anonymized
    fields_anonymized = models.JSONField(
        help_text="Dict of field_name: true for each anonymized field"
    )
    
    # Cryptographic proof of original data (SHA-256)
    original_data_hash = models.CharField(
        max_length=64,
        help_text="SHA-256 hash of original PII for audit verification"
    )
    
    # Trigger context
    trigger = models.CharField(max_length=30, choices=TRIGGER_CHOICES)
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
    related_request_id = models.UUIDField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Anonymization Log'
        verbose_name_plural = 'Anonymization Logs'
        indexes = [
            models.Index(fields=['trigger', 'created_at']),
        ]
    
    def __str__(self):
        return f"Anonymization - {self.lead_phone} - {self.trigger} - {self.created_at.strftime('%Y-%m-%d')}"
    
    @classmethod
    def verify_original_data(cls, lead_id: uuid.UUID, provided_data: dict) -> bool:
        """
        Verify that provided data matches the original hash.
        Used for audit verification.
        """
        try:
            log = cls.objects.filter(lead_id=lead_id).latest('created_at')
            expected_hash = hashlib.sha256(
                json.dumps(provided_data, sort_keys=True).encode()
            ).hexdigest()
            return log.original_data_hash == expected_hash
        except cls.DoesNotExist:
            return False