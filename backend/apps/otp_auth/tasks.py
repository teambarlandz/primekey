"""Django-Q2 task: purge expired / used OTP codes.

Registered as a recurring schedule in ``apps.otp_auth.apps``.
"""

from django.utils import timezone

from apps.otp_auth.models import OTPCode


def cleanup_expired_otps():
    """Delete OTP records that are expired or already used."""
    now = timezone.now()
    qs = OTPCode.objects.filter(used=True) | OTPCode.objects.filter(expires_at__lt=now)
    _deleted, count = qs.distinct().delete()
    return f"Cleaned up {count} OTP record(s)"
