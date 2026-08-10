"""Security middleware for Primekey Homes.

- TrustedProxyIPMiddleware: normalizes ``REMOTE_ADDR`` from the proxy-set
  ``X-Real-IP`` or ``X-Forwarded-For`` header when the peer is a trusted
  reverse proxy (nginx). django-ratelimit keys off ``REMOTE_ADDR``; without
  this every client behind the proxy shares one IP. The proxy header is only
  honored when the peer is on a private/loopback network, so a directly
  exposed server cannot be spoofed. Header values are validated as IP
  addresses before being applied.
- IdleSessionMiddleware: expires session-based (staff/admin) logins after a
  period of inactivity, forcing re-authentication.
"""

import ipaddress
from datetime import datetime

from django.conf import settings
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone


def _is_private_or_loopback(address):
    try:
        ip = ipaddress.ip_address(address)
    except ValueError:
        return False
    return ip.is_private or ip.is_loopback


def _validated_ip(value):
    """Return a normalized IP string, or None if the value is not an IP."""
    try:
        return ipaddress.ip_address(value.strip()).compressed
    except (ValueError, AttributeError):
        return None


class TrustedProxyIPMiddleware:
    """Use the proxy-set ``X-Real-IP`` / ``X-Forwarded-For`` when the peer is a trusted proxy."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        remote_addr = request.META.get("REMOTE_ADDR", "")
        if not _is_private_or_loopback(remote_addr):
            # Peer is not a trusted proxy - never trust proxy headers.
            return self.get_response(request)

        client_ip = None
        x_real_ip = request.META.get("HTTP_X_REAL_IP", "")
        if x_real_ip:
            client_ip = _validated_ip(x_real_ip)

        if client_ip is None:
            # X-Forwarded-For is a comma-separated list; the first entry is
            # the original client when a single trusted proxy is in play.
            xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
            first_hop = xff.split(",")[0].strip() if xff else ""
            if first_hop:
                client_ip = _validated_ip(first_hop)

        if client_ip:
            request.META["REMOTE_ADDR"] = client_ip
        return self.get_response(request)


class IdleSessionMiddleware:
    """Log out session-authenticated users after ``SESSION_IDLE_TIMEOUT_SECONDS``."""

    def __init__(self, get_response):
        self.get_response = get_response
        self.timeout = getattr(settings, "SESSION_IDLE_TIMEOUT_SECONDS", 30 * 60)

    @staticmethod
    def _parse_last_activity(value):
        """Parse a stored last-activity value into a tz-aware datetime."""
        if isinstance(value, datetime):
            last_activity = value
        elif isinstance(value, str):
            try:
                last_activity = datetime.fromisoformat(value)
            except ValueError:
                return None
        else:
            return None
        if last_activity.tzinfo is None:
            last_activity = last_activity.replace(tzinfo=timezone.utc)
        return last_activity

    def __call__(self, request):
        if request.session.get("_auth_user_id"):
            now = timezone.now()
            last_activity = self._parse_last_activity(
                request.session.get("last_activity")
            )

            if last_activity is None:
                # First request after login (or corrupt value) - start the clock.
                request.session["last_activity"] = now.isoformat()
                request.session.modified = True
            elif (now - last_activity).total_seconds() > self.timeout:
                request.session.flush()
                if request.path.startswith("/admin/"):
                    return HttpResponseRedirect(
                        reverse("admin:login") + "?next=" + request.path
                    )
            else:
                request.session["last_activity"] = now.isoformat()
                request.session.modified = True

        return self.get_response(request)
