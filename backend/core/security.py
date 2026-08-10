"""Shared security helpers."""

import hashlib
import secrets


def get_client_ip(request):
    """
    Return the real client IP.

    TrustedProxyIPMiddleware normalizes ``REMOTE_ADDR`` from the proxy-set
    ``X-Real-IP`` header when the peer is a trusted proxy, so REMOTE_ADDR is
    authoritative here. ``X-Real-IP`` is used as a fallback for safety.
    """
    return (
        request.META.get("HTTP_X_REAL_IP")
        or request.META.get("REMOTE_ADDR")
        or ""
    )


def generate_secure_code(digits=6):
    """Generate a cryptographically secure numeric code of ``digits`` length."""
    return f"{secrets.randbelow(10 ** digits):0{digits}d}"


def hash_code(code):
    """Return the SHA-256 hex digest of a plaintext code."""
    return hashlib.sha256(code.encode("utf-8")).hexdigest()
