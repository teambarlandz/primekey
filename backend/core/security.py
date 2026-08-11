"""Shared security helpers.

- ``get_client_ip``: returns the real client IP, honoring proxy-set headers
  (``X-Real-IP`` / ``X-Forwarded-For``) ONLY when the direct peer is a trusted
  private/loopback proxy. A directly exposed server never trusts client
  headers, so ``X-Real-IP`` cannot be spoofed to bypass IP-based rate limits.
- ``generate_secure_code`` / ``hash_code`` / ``verify_code``: cryptographically
  secure code generation and salted HMAC-SHA256 hashing with constant-time
  comparison. Legacy unsalted SHA-256 digests remain verifiable.
- ``is_dev_client``: True only for loopback clients while DEBUG is enabled
  (used to gate development-only conveniences such as the OTP ``dev_code``).
"""

import hashlib
import hmac
import ipaddress
import secrets

from django.conf import settings


def _is_private_or_loopback(address):
    try:
        ip = ipaddress.ip_address(address)
    except (ValueError, AttributeError):
        return False
    return ip.is_private or ip.is_loopback


def _validated_ip(value):
    """Return a normalized IP string, or None if the value is not an IP."""
    try:
        return ipaddress.ip_address(value.strip()).compressed
    except (ValueError, AttributeError):
        return None


def get_client_ip(request):
    """
    Return the real client IP address.

    The ``TrustedProxyIPMiddleware`` already rewrites ``REMOTE_ADDR`` from the
    proxy-set header when the peer is a trusted proxy, so ``REMOTE_ADDR`` is
    authoritative here. As defense-in-depth, proxy headers are honored only
    when the direct peer itself is a private/loopback address; otherwise the
    raw ``REMOTE_ADDR`` is returned and client-supplied headers are ignored.
    """
    remote_addr = request.META.get("REMOTE_ADDR", "") or ""
    if remote_addr and _is_private_or_loopback(remote_addr):
        x_real_ip = request.META.get("HTTP_X_REAL_IP", "")
        if x_real_ip:
            client_ip = _validated_ip(x_real_ip)
            if client_ip:
                return client_ip
        xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
        first_hop = xff.split(",")[0].strip() if xff else ""
        if first_hop:
            client_ip = _validated_ip(first_hop)
            if client_ip:
                return client_ip
    return remote_addr


def is_dev_client(request):
    """True only for loopback clients while DEBUG is enabled."""
    if not settings.DEBUG:
        return False
    return _is_private_or_loopback(get_client_ip(request) or "")


def generate_secure_code(digits=6):
    """Generate a cryptographically secure numeric code of ``digits`` length."""
    return f"{secrets.randbelow(10 ** digits):0{digits}d}"


def hash_code(code, salt=None):
    """
    Return a salted HMAC-SHA256 digest of a plaintext code as ``salt:digest``.

    The per-code salt defeats precomputation/rainbow attacks against the
    6-digit code space even if the database (and the server's secret key) leak.
    """
    if not isinstance(code, str):
        code = str(code)
    salt = salt or secrets.token_hex(8)
    digest = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        f"{salt}:{code}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{salt}:{digest}"


def verify_code(stored, code):
    """
    Constant-time comparison of ``code`` against a stored digest.

    Supports both the new salted HMAC format (``salt:digest``) and legacy
    unsalted SHA-256 digests for backward compatibility with existing rows.
    """
    if not stored or not isinstance(code, str):
        return False
    if ":" in stored:
        salt, digest = stored.split(":", 1)
        candidate = hash_code(code, salt=salt)
        return hmac.compare_digest(candidate, stored)
    candidate = hashlib.sha256(code.encode("utf-8")).hexdigest()
    return hmac.compare_digest(candidate, stored)


def check_and_record_failure(cache_key, max_attempts=3, lock_seconds=300):
    """
    Record a failed attempt against ``cache_key`` and return the number of
    seconds the key is now locked (0 if not yet locked). Subsequent callers
    can query ``remaining_lock(cache_key)`` to enforce the backoff.
    """
    from django.core.cache import cache

    current = int(cache.get(cache_key, 0) or 0) + 1
    cache.set(cache_key, current, lock_seconds)
    return lock_seconds if current >= max_attempts else 0


def remaining_lock(cache_key):
    """Remaining lock seconds for a failure counter (0 if not locked)."""
    from django.core.cache import cache

    return int(cache.get(cache_key, 0) or 0)


def clear_failures(cache_key):
    """Reset a failure counter (e.g. after a successful verification)."""
    from django.core.cache import cache

    cache.delete(cache_key)
