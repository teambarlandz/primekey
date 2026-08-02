import uuid
import random
from django.db import models
from django.utils import timezone
from django.conf import settings


class OTPCode(models.Model):
    """
    One-time password code for phone authentication.
    """
    PURPOSE_CHOICES = [
        ('login', 'Login / Sign In'),
        ('register', 'Registration Verification'),
        ('password_reset', 'Password Reset'),
        ('agent_login', 'Agent Login'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, db_index=True)
    code = models.CharField(max_length=6)
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

    @classmethod
    def generate_code(cls):
        """Generate a 6-digit numeric code."""
        return ''.join(str(random.randint(0, 9)) for _ in range(6))

    @classmethod
    def create_otp(cls, phone, purpose='login', expiry_minutes=5, ip_address=None, user_agent=None):
        """Create a new OTP code for the given phone."""
        # Invalidate any existing unused OTPs for this phone/purpose
        cls.objects.filter(phone=phone, purpose=purpose, used=False).update(used=True)
        
        code = cls.generate_code()
        expires_at = timezone.now() + timezone.timedelta(minutes=expiry_minutes)
        
        return cls.objects.create(
            phone=phone,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    def verify(self, code):
        """Verify the provided code against this OTP."""
        if self.used:
            return False, "OTP has already been used"
        
        if timezone.now() > self.expires_at:
            return False, "OTP has expired"
        
        if self.attempts >= 3:
            return False, "Too many attempts. Please request a new code."
        
        self.attempts += 1
        self.save(update_fields=['attempts'])
        
        if self.code != code:
            return False, "Invalid code"
        
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])
        return True, "Verified successfully"

    def is_valid(self):
        """Check if OTP is still valid (not used, not expired)."""
        return not self.used and timezone.now() <= self.expires_at