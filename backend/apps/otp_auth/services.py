"""
OTP delivery services — Resend (email) and Sendchamp (SMS).

Both providers are optional in dev: if API keys are not configured,
the service logs and returns True so the OTP flow still works via
`dev_code` (is_dev_client). In production, missing keys raise and
the view returns 502 so the client knows delivery failed.

Resend docs: https://resend.com/docs/api-reference/emails/send-email
Sendchamp docs: https://api.sendchamp.com/docs#send-sms
"""
import logging
import re

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _normalize_phone_for_sendchamp(phone: str) -> str:
    """Convert 080... / +234... to 23480... for Sendchamp `to`."""
    digits = re.sub(r"[^0-9]", "", phone)
    if digits.startswith("0"):
        return f"234{digits[1:]}"
    if digits.startswith("234"):
        return digits
    return digits  # fallback


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


def send_otp_via_sendchamp(phone: str, code: str, purpose: str = "login") -> bool:
    """
    Send OTP code via Sendchamp SMS.
    Returns True on success, False if skipped (no key), raises on hard failure.
    """
    api_key = getattr(settings, "SENDCHAMP_API_KEY", "") or ""
    if not api_key:
        logger.warning("SENDCHAMP_API_KEY not set — skipping SMS OTP to %s (dev mode)", phone)
        return False

    sender_name = getattr(settings, "SENDCHAMP_SENDER_ID", "Primekey")
    # Sendchamp route: dnd for transactional, non_dnd for marketing. OTP is transactional.
    route = getattr(settings, "SENDCHAMP_ROUTE", "dnd")

    to = _normalize_phone_for_sendchamp(phone)
    message = f"Your Primekey verification code is {code}. It expires in 5 minutes. Do not share this code."

    try:
        resp = requests.post(
            "https://api.sendchamp.com/api/v1/sms/send",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "to": [to],
                "message": message,
                "sender_name": sender_name,
                "route": route,
            },
            timeout=10,
        )
        # Sendchamp returns 200 or 201 on success with {status, message, data}
        if resp.status_code in (200, 201):
            body = resp.json()
            # Some Sendchamp errors return 200 with status != success, check
            if isinstance(body, dict) and body.get("status") == "error":
                logger.error("Sendchamp logical error %s", body)
                resp.raise_for_status()
            logger.info("Sendchamp OTP sent to %s (purpose=%s)", phone, purpose)
            return True
        logger.error("Sendchamp failed %s %s", resp.status_code, resp.text[:500])
        resp.raise_for_status()
        return False
    except Exception as exc:
        logger.exception("Sendchamp exception to %s: %s", phone, exc)
        raise
