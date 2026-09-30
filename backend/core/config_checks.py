"""Production configuration validation.

Pure functions that raise ``ImproperlyConfigured`` when security-critical
settings are left at insecure defaults. Kept in a separate module so the
checks can be unit-tested without touching the live settings object.
"""

import string

from django.core.exceptions import ImproperlyConfigured

WEAK_SECRET_KEYS = {
    "",
    "django-insecure-dev-key-change-in-production",
    "secret",
    "changeme",
    "django-insecure",
    "insecure",
}

MIN_SECRET_KEY_LENGTH = 50


def validate_secret_key(secret_key):
    """Reject known/weak/duplicate-char SECRET_KEY values."""
    if secret_key in WEAK_SECRET_KEYS:
        raise ImproperlyConfigured(
            "SECRET_KEY must be overridden with a strong, unique value."
        )
    if len(secret_key) < MIN_SECRET_KEY_LENGTH:
        raise ImproperlyConfigured(
            f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters long."
        )
    if len(set(secret_key)) < 12:
        raise ImproperlyConfigured(
            "SECRET_KEY has too little entropy (too many repeated characters)."
        )


def validate_allowed_hosts(hosts):
    """Reject wildcard hosts and enforce at least one explicit host."""
    if not hosts:
        raise ImproperlyConfigured("ALLOWED_HOSTS must be set when DEBUG=False.")
    if "*" in hosts:
        raise ImproperlyConfigured(
            "ALLOWED_HOSTS must not contain '*' when DEBUG=False."
        )
    if any(host.startswith("*.") for host in hosts):
        raise ImproperlyConfigured(
            "ALLOWED_HOSTS must not contain wildcard subdomains when DEBUG=False."
        )


def validate_otp_providers(*, resend_api_key, required=True):
    """
    Reject an unconfigured email OTP provider in production.

    Without this, a missing API key makes ``send_otp_via_resend`` return
    ``False`` and the send endpoint still answers 200, so the client sees
    "OTP sent" while nothing is ever delivered. Fail at boot instead.
    """
    if not required:
        return

    if not (resend_api_key or "").strip():
        raise ImproperlyConfigured(
            "RESEND_API_KEY is not set, so email OTP cannot be delivered. "
            "Set it in the deployment environment, or set "
            "REQUIRE_OTP_PROVIDERS=False to boot without OTP delivery."
        )


def validate_production_settings(
    *,
    secret_key,
    debug,
    allowed_hosts,
    require_otp_providers=True,
    resend_api_key="",
):
    """
    Full production guard. Raises ``ImproperlyConfigured`` on any violation.
    """
    if debug:
        # Allow DEBUG locally; the runtime loopback guard (is_dev_client)
        # prevents development conveniences from leaking over the network.
        return
    validate_secret_key(secret_key)
    validate_allowed_hosts(allowed_hosts)
    validate_otp_providers(
        resend_api_key=resend_api_key,
        required=require_otp_providers,
    )
