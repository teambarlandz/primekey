import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings

from core.security import (
    check_and_record_failure,
    clear_failures,
    generate_secure_code,
    hash_code,
    remaining_lock,
    verify_code,
)

# Global per-phone brute-force lockout shared across ALL codes for a phone,
# so requesting a new code does not reset the backoff.
OTP_LOCK_PREFIX = "otp_lock:"
OTP_MAX_FAILURES = 3
OTP_LOCK_SECONDS = 300


class OTPCode(models.Model):
    """
    One-time password code for phone authentication.

    Only a salted HMAC-SHA256 digest of the code is stored in the database;
    the plaintext is available on the in-memory ``_plaintext_code`` attribute
    immediately after creation (used only to surface ``dev_code`` for
    loopback development clients).
    """
    PURPOSE_CHOICES = [
        ('login', 'Login / Sign In'),
        ('register', 'Registration Verification'),
        ('password_reset', 'Password Reset'),
        ('agent_login', 'Agent Login'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, db_index=True)
    code = models.CharField(max_length=128, help_text="Salted HMAC-SHA256 digest of the 6-digit code")
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='login')
    
    # Expiry
    expires_at = models.DateTimeField()
    
    # Usage tracking
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(blank=True, null=True)
    attempts = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'OTP Code'
        verbose_name_plural = 'OTP Codes'
        indexes = [
            models.Index(fields=['phone', 'purpose', 'used']),
        ]

    def __str__(self):
        return f"OTP for {self.phone} ({self.purpose}) - {'Used' if self.used else 'Active'}"

    @staticmethod
    def hash_code(code):
        """Return the salted HMAC-SHA256 digest of a plaintext code."""
        return hash_code(code)

    @classmethod
    def generate_code(cls):
        """Generate a cryptographically secure 6-digit numeric code."""
        return generate_secure_code(6)

    @classmethod
    def create_otp(cls, phone, purpose='login', expiry_minutes=5, ip_address=None, user_agent=None):
        """Create a new OTP code for the given phone."""
        # Invalidate any existing unused OTPs for this phone/purpose
        cls.objects.filter(phone=phone, purpose=purpose, used=False).update(used=True)
        
        code = cls.generate_code()
        expires_at = timezone.now() + timezone.timedelta(minutes=expiry_minutes)
        
        otp = cls.objects.create(
            phone=phone,
            code=hash_code(code),
            purpose=purpose,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        otp._plaintext_code = code
        return otp

    def _lock_key(self):
        return f"{OTP_LOCK_PREFIX}{self.phone}:{self.purpose}"

    def verify(self, code, ip_address=None, user_agent=None):
        """
        Verify the provided code against this OTP.

        - Enforces the global per-phone lockout (not reset by new codes).
        - Binds verification to the IP address and user agent recorded at
          send time (enforced only when the stored values are non-empty).
        - Constant-time comparison of salted HMAC digests (legacy unsalted
          SHA-256 digests remain verifiable).
        """
        if self.used:
            return False, "OTP has already been used"
        
        if timezone.now() > self.expires_at:
            return False, "OTP has expired"

        if remaining_lock(self._lock_key()) > 0:
            return False, "Too many failed attempts. Please wait a few minutes."

        if self.ip_address and ip_address and str(self.ip_address) != str(ip_address):
            return False, "This code cannot be used from this device or location. Please request a new code."
        if self.user_agent and user_agent and self.user_agent != user_agent:
            return False, "This code cannot be used from this device. Please request a new code."
        
        if self.attempts >= 3:
            return False, "Too many attempts. Please request a new code."
        
        self.attempts += 1
        self.save(update_fields=['attempts'])
        
        if not verify_code(self.code, code):
            check_and_record_failure(
                self._lock_key(),
                max_attempts=OTP_MAX_FAILURES,
                lock_seconds=OTP_LOCK_SECONDS,
            )
            return False, "Invalid code"
        
        clear_failures(self._lock_key())
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])
        return True, "Verified successfully"

    def is_valid(self):
        """Check if OTP is still valid (not used, not expired)."""
        return not self.used and timezone.now() <= self.expires_at
