import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class TermiiService:
    """Send SMS OTP codes via Termii API."""

    API_URL = "https://vapi.ng.termii.com/api/sms/send"

    def __init__(self):
        self.api_key = getattr(settings, "TERMII_API_KEY", "")
        self.sender_id = getattr(settings, "TERMII_SENDER_ID", "PrimeKey")
        self.channel = getattr(settings, "TERMII_CHANNEL", "dnd")

    def send(self, phone: str, message: str) -> bool:
        if not self.api_key:
            logger.warning("TERMII_API_KEY not configured — SMS not sent")
            return False

        try:
            response = requests.post(
                self.API_URL,
                json={
                    "api_key": self.api_key,
                    "to": phone,
                    "from": self.sender_id,
                    "sms": message,
                    "type": "plain",
                    "channel": self.channel,
                },
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            if data.get("code") == "ok":
                return True
            logger.error("Termii API error: %s", data)
            return False
        except requests.RequestException:
            logger.exception("Failed to send SMS via Termii")
            return False


def send_otp_sms(phone: str, code: str) -> bool:
    """
    Send an OTP code via SMS. Falls back to console logging in dev.
    """
    message = f"Your Primekey Homes verification code is {code}. It expires in 5 minutes."

    if getattr(settings, "SMS_PROVIDER", "") == "termii":
        return TermiiService().send(phone, message)

    # Dev fallback: log to console
    logger.info("OTP for %s: %s", phone, code)
    return True
