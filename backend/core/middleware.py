"""Security middleware for Primekey Homes.

- TrustedProxyIPMiddleware: normalizes ``REMOTE_ADDR`` from the ``X-Real-IP``
  header set by the trusted reverse proxy (nginx). django-ratelimit keys off
  ``REMOTE_ADDR``; without this every client behind the proxy shares one IP.
  The proxy header is only honored when the peer is on a private/loopback
  network, so a directly exposed server cannot be spoofed.
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


class TrustedProxyIPMiddleware:
    """Use the proxy-set ``X-Real-IP`` when the peer is a trusted proxy."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        x_real_ip = request.META.get("HTTP_X_REAL_IP")
        remote_addr = request.META.get("REMOTE_ADDR", "")
        if x_real_ip and _is_private_or_loopback(remote_addr):
            request.META["REMOTE_ADDR"] = x_real_ip.strip()
        return self.get_response(request)


class IdleSessionMiddleware:
    """Log out session-authenticated users after ``SESSION_IDLE_TIMEOUT_SECONDS``."""

    def __init__(self, get_response):
        self.get_response = get_response
        self.timeout = getattr(settings, "SESSION_IDLE_TIMEOUT_SECONDS", 30 * 60)

    def __call__(self, request):
        if request.session.get("_auth_user_id"):
            last_activity = request.session.get("last_activity")
            now = timezone.now()

            if last_activity is None or not isinstance(last_activity, datetime):
                # First request after login (or corrupt value) - start the clock.
                request.session["last_activity"] = now
                request.session.modified = True
            elif (now - last_activity).total_seconds() > self.timeout:
                request.session.flush()
                if request.path.startswith("/admin/"):
                    return HttpResponseRedirect(
                        reverse("admin:login") + "?next=" + request.path
                    )
            else:
                request.session["last_activity"] = now
                request.session.modified = True

        return self.get_response(request)
