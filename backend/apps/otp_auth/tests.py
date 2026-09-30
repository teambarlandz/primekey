import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.dashboard.models import AgentProfile
from .models import OTPCode

pytestmark = pytest.mark.django_db

User = get_user_model()

AGENT_EMAIL = "agent@primekey.test"
AGENT_PHONE = "08070000000"


def send_and_verify(client, email, purpose):
    send_response = client.post(
        "/api/v1/auth/otp/send/",
        {"email": email, "purpose": purpose},
        format="json",
    )
    assert send_response.status_code == 200
    code = send_response.data["data"]["dev_code"]
    return client.post(
        "/api/v1/auth/otp/verify/",
        {"email": email, "code": code, "purpose": purpose},
        format="json",
    )


def make_agent(email=AGENT_EMAIL, phone=AGENT_PHONE, is_active=True, role="manager"):
    user = User.objects.create_user(username=phone, email=email, password="x")
    agent = AgentProfile.objects.create(
        user=user,
        phone=phone,
        full_name="Ada Agent",
        role=role,
        is_active=is_active,
    )
    return agent


class TestAgentLogin:
    @pytest.fixture(autouse=True)
    def _debug_mode(self, settings):
        settings.DEBUG = True

    def test_agent_login_returns_tokens_and_role(self):
        make_agent()

        response = send_and_verify(APIClient(), AGENT_EMAIL, "agent_login")

        assert response.status_code == 200
        data = response.data["data"]
        assert data["access"]
        assert data["refresh"]
        assert data["user"]["role"] == "manager"
        assert data["user"]["email"] == AGENT_EMAIL
        assert data["user"]["phone"] == AGENT_PHONE
        assert data["user"]["full_name"] == "Ada Agent"

    def test_agent_login_unknown_email_forbidden(self):
        response = send_and_verify(APIClient(), "nobody@primekey.test", "agent_login")
        assert response.status_code == 403

    def test_agent_login_inactive_agent_forbidden(self):
        make_agent(is_active=False)
        response = send_and_verify(APIClient(), AGENT_EMAIL, "agent_login")
        assert response.status_code == 403

    def test_agent_without_email_cannot_receive_a_code(self):
        """Agent accounts need an email to receive a code at all."""
        make_agent(email="", phone="08071111111")
        response = APIClient().post(
            "/api/v1/auth/otp/send/",
            {"email": "", "purpose": "agent_login"},
            format="json",
        )
        assert response.status_code == 400

    def test_issued_token_unlocks_dashboard(self):
        make_agent()

        login_response = send_and_verify(APIClient(), AGENT_EMAIL, "agent_login")
        access = login_response.data["data"]["access"]

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = client.get("/api/v1/dashboard/summary/")
        assert response.status_code == 200

    def test_regular_login_does_not_create_phone_field_error(self):
        response = send_and_verify(APIClient(), "user@primekey.test", "login")
        assert response.status_code == 200
        assert OTPCode.objects.filter(
            email="user@primekey.test", purpose="login", used=True
        ).count() == 1


class TestEmailOnlyOTP:
    @pytest.fixture(autouse=True)
    def _debug_mode(self, settings):
        settings.DEBUG = True

    def test_phone_only_request_is_rejected(self):
        """SMS was removed: a phone number alone is no longer a valid identifier."""
        response = APIClient().post(
            "/api/v1/auth/otp/send/",
            {"phone": "08012345678", "purpose": "login"},
            format="json",
        )
        assert response.status_code == 400

    def test_stale_sms_channel_payload_is_ignored(self):
        """A client still sending channel=sms must not break or switch channel."""
        response = APIClient().post(
            "/api/v1/auth/otp/send/",
            {"email": "user@primekey.test", "channel": "sms", "purpose": "login"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["data"]["email"] == "user@primekey.test"
        assert "channel" not in response.data["data"]

    def test_response_reports_email_not_channel(self):
        response = APIClient().post(
            "/api/v1/auth/otp/send/",
            {"email": "user@primekey.test", "purpose": "login"},
            format="json",
        )
        assert response.status_code == 200
        data = response.data["data"]
        assert data["email"] == "user@primekey.test"
        assert "channel" not in data
        assert "phone" not in data

    def test_otp_row_has_no_phone_or_channel(self):
        send_and_verify(APIClient(), "user@primekey.test", "login")
        otp = OTPCode.objects.get(email="user@primekey.test")
        assert not hasattr(otp, "phone")
        assert not hasattr(otp, "channel")

    def test_resending_invalidates_the_previous_code(self):
        client = APIClient()
        first = client.post(
            "/api/v1/auth/otp/send/",
            {"email": "user@primekey.test", "purpose": "login"},
            format="json",
        )
        first_code = first.data["data"]["dev_code"]

        client.post(
            "/api/v1/auth/otp/send/",
            {"email": "user@primekey.test", "purpose": "login"},
            format="json",
        )

        stale = client.post(
            "/api/v1/auth/otp/verify/",
            {"email": "user@primekey.test", "code": first_code, "purpose": "login"},
            format="json",
        )
        assert stale.status_code == 400
