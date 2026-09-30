"""
OTP delivery service — Resend (email only).

Email is the sole OTP channel: SMS via Sendchamp was removed to cut
production cost, so every code is delivered by Resend.

If the API key is not configured the service returns False and the caller
decides what to do (503 in production, dev_code in development).

Resend docs: https://resend.com/docs/api-reference/emails/send-email
"""
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def send_otp_via_resend(email: str, code: str, purpose: str = "login") -> bool:
    """
    Send OTP code via Resend email.
    Returns True on success, False if skipped (no key), raises on hard failure.
    """
    api_key = getattr(settings, "RESEND_API_KEY", "") or ""
    if not api_key:
        logger.warning("RESEND_API_KEY not set — skipping email OTP to %s (dev mode)", email)
        return False

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "Primekey Homes <hello@primekeyhomesandpropertiesltd.com>")
    # Resend requires a verified sender domain; use DEFAULT_FROM_EMAIL
    subject_map = {
        "login": "Your Primekey login code",
        "register": "Verify your Primekey account",
        "agent_login": "Your Primekey agent login code",
        "password_reset": "Your Primekey password reset code",
    }
    subject = subject_map.get(purpose, "Your Primekey verification code")
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #04164a;">Primekey Homes</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #04164a; text-align: center; padding: 16px; background: #f3f0ff; border-radius: 12px;">{code}</p>
      <p style="color: #4a607a; font-size: 14px;">This code expires in 5 minutes. Do not share it with anyone.</p>
      <p style="color: #4a607a; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
    """
    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": from_email,
                "to": [email],
                "subject": subject,
                "html": html,
            },
            timeout=10,
        )
        if resp.status_code in (200, 201):
            logger.info("Resend OTP sent to %s (purpose=%s) id=%s", email, purpose, resp.json().get("id"))
            return True
        logger.error("Resend failed %s %s", resp.status_code, resp.text[:500])
        resp.raise_for_status()
        return False
    except Exception as exc:
        logger.exception("Resend exception to %s: %s", email, exc)
        raise
