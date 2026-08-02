import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.dashboard.models import AgentProfile
from .models import OTPCode

pytestmark = pytest.mark.django_db

User = get_user_model()


def send_and_verify(client, phone, purpose):
    send_response = client.post(
        "/api/v1/auth/otp/send/",
        {"phone": phone, "purpose": purpose},
        format="json",
    )
    assert send_response.status_code == 200
    code = send_response.data["data"]["dev_code"]
    return client.post(
        "/api/v1/auth/otp/verify/",
        {"phone": phone, "code": code, "purpose": purpose},
        format="json",
    )


class TestAgentLogin:
    def test_agent_login_returns_tokens_and_role(self):
        user = User.objects.create_user(username="08070000000", password="x")
        agent = AgentProfile.objects.create(
            user=user,
            phone="08070000000",
            full_name="Ada Agent",
            role="manager",
        )

        response = send_and_verify(APIClient(), agent.phone, "agent_login")

        assert response.status_code == 200
        data = response.data["data"]
        assert data["access"]
        assert data["refresh"]
        assert data["user"]["role"] == "manager"
        assert data["user"]["phone"] == "08070000000"
        assert data["user"]["full_name"] == "Ada Agent"

    def test_agent_login_unknown_phone_forbidden(self):
        response = send_and_verify(APIClient(), "08090000000", "agent_login")
        assert response.status_code == 403

    def test_agent_login_inactive_agent_forbidden(self):
        user = User.objects.create_user(username="08070000000", password="x")
        AgentProfile.objects.create(
            user=user,
            phone="08070000000",
            is_active=False,
        )
        response = send_and_verify(APIClient(), "08070000000", "agent_login")
        assert response.status_code == 403

    def test_issued_token_unlocks_dashboard(self):
        user = User.objects.create_user(username="08070000000", password="x")
        AgentProfile.objects.create(user=user, phone="08070000000")

        login_response = send_and_verify(APIClient(), "08070000000", "agent_login")
        access = login_response.data["data"]["access"]

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = client.get("/api/v1/dashboard/summary/")
        assert response.status_code == 200

    def test_regular_login_does_not_create_phone_field_error(self):
        response = send_and_verify(APIClient(), "08060000000", "login")
        assert response.status_code == 200
        assert OTPCode.objects.filter(phone="08060000000", purpose="login", used=True).count() == 1
