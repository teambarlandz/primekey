import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.dashboard.models import AgentProfile
from apps.messaging.models import WhatsAppThread, WhatsAppMessage

pytestmark = pytest.mark.django_db

User = get_user_model()


@pytest.fixture
def agent_client():
    user = User.objects.create_user(username="08050000000", password="testpass123")
    AgentProfile.objects.create(user=user, phone="08050000000", full_name="Test Agent")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class TestWhatsAppThreads:
    def test_create_thread_with_outbound_message(self, agent_client):
        response = agent_client.post(
            "/api/v1/messaging/threads/",
            {
                "phone": "08012345678",
                "display_name": "Jane Buyer",
                "message": "Hello Jane, we found a property for you!",
            },
            format="json",
        )
        assert response.status_code == 201
        data = response.data["data"]
        assert data["phone"] == "08012345678"
        assert data["last_message"] == "Hello Jane, we found a property for you!"
        assert data["message_count"] == 1

        thread = WhatsAppThread.objects.get(phone="08012345678")
        assert WhatsAppMessage.objects.filter(thread=thread).count() == 1
        assert thread.last_message_at is not None

    def test_create_thread_reuses_existing_by_phone(self, agent_client):
        thread = WhatsAppThread.objects.create(phone="08012345678", display_name="Jane")
        response = agent_client.post(
            "/api/v1/messaging/threads/",
            {"phone": "08012345678", "message": "Follow up"},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["data"]["id"] == str(thread.id)
        assert WhatsAppThread.objects.filter(phone="08012345678").count() == 1
        assert thread.messages.count() == 1

    def test_list_threads_requires_agent(self):
        response = APIClient().get("/api/v1/messaging/threads/")
        assert response.status_code == 401

    def test_list_threads(self, agent_client):
        WhatsAppThread.objects.create(phone="08011111111", display_name="Buyer One")
        WhatsAppThread.objects.create(phone="08022222222", display_name="Buyer Two")
        response = agent_client.get("/api/v1/messaging/threads/")
        assert response.status_code == 200
        assert len(response.data["data"]) == 2


class TestWhatsAppMessages:
    def test_message_history(self, agent_client):
        thread = WhatsAppThread.objects.create(phone="08012345678")
        WhatsAppMessage.objects.create(thread=thread, body="Hi there")
        WhatsAppMessage.objects.create(thread=thread, body="We have a listing for you", direction="outbound")

        response = agent_client.get(f"/api/v1/messaging/threads/{thread.id}/messages/")
        assert response.status_code == 200
        assert len(response.data["data"]) == 2
        assert response.data["data"][0]["body"] == "Hi there"

    def test_add_message_updates_thread(self, agent_client):
        thread = WhatsAppThread.objects.create(phone="08012345678")
        response = agent_client.post(
            f"/api/v1/messaging/threads/{thread.id}/messages/",
            {"body": "See our new offers"},
            format="json",
        )
        assert response.status_code == 201
        thread.refresh_from_db()
        assert thread.last_message == "See our new offers"
        assert thread.last_message_at is not None

    def test_message_thread_not_found(self, agent_client):
        import uuid
        response = agent_client.get(f"/api/v1/messaging/threads/{uuid.uuid4()}/messages/")
        assert response.status_code == 404
