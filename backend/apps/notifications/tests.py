import pytest

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.notifications.models import Notification
from apps.landlords.models import LandlordProfile
from apps.dashboard.models import AgentProfile

User = get_user_model()


@pytest.fixture
def make_landlord():
    def _make(**overrides):
        data = {
            "full_name": "Test Landlord",
            "phone": "08012345678",
            "email": "landlord@example.com",
            "id_type": "nin",
            "id_number": "12345678901",
            "property_count": 1,
            "ndpr_consent": True,
        }
        data.update(overrides)
        return LandlordProfile.objects.create(**data)
    return _make


@pytest.fixture
def agent_client():
    user = User.objects.create_user(username="08050000000", password="testpass123")
    AgentProfile.objects.create(user=user, phone="08050000000", full_name="Test Agent", role="manager")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def landlord_client(make_landlord):
    def _client(landlord=None):
        landlord = landlord or make_landlord()
        user = User.objects.create_user(username=landlord.phone, password="testpass123")
        client = APIClient()
        client.force_authenticate(user=user)
        return client
    return _client


@pytest.mark.django_db
def test_list_notifications_for_landlord(make_landlord, landlord_client):
    landlord = make_landlord()
    Notification.objects.create(
        recipient_type="landlord",
        recipient_id=landlord.id,
        title="Listing approved",
        message="Your listing was approved.",
    )
    Notification.objects.create(
        recipient_type="landlord",
        recipient_id=landlord.id,
        title="Listing approved 2",
        message="Your listing was approved.",
        is_read=True,
    )

    response = landlord_client(landlord).get(
        f"/api/v1/notifications/?recipient_type=landlord&recipient_id={landlord.id}"
    )
    assert response.status_code == 200
    assert len(response.data["data"]) == 2
    assert response.data["unread_count"] == 1


@pytest.mark.django_db
def test_list_notifications_forbidden_for_other_user(make_landlord):
    landlord = make_landlord()
    Notification.objects.create(
        recipient_type="landlord",
        recipient_id=landlord.id,
        title="Listing approved",
        message="Your listing was approved.",
    )

    other = User.objects.create_user(username="08099999999", password="testpass123")
    client = APIClient()
    client.force_authenticate(user=other)
    response = client.get(
        f"/api/v1/notifications/?recipient_type=landlord&recipient_id={landlord.id}"
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_list_agent_notifications_without_recipient_id(make_landlord, agent_client):
    landlord = make_landlord()
    Notification.objects.create(
        recipient_type="agent",
        recipient_id=landlord.id,
        title="Appointment updated by landlord",
        message="A landlord updated their appointment.",
    )

    response = agent_client.get("/api/v1/notifications/?recipient_type=agent")
    assert response.status_code == 200
    assert len(response.data["data"]) == 1


@pytest.mark.django_db
def test_requires_recipient_type(agent_client):
    response = agent_client.get("/api/v1/notifications/")
    assert response.status_code == 400


@pytest.mark.django_db
def test_mark_notification_read(make_landlord, landlord_client):
    landlord = make_landlord()
    notification = Notification.objects.create(
        recipient_type="landlord",
        recipient_id=landlord.id,
        title="Test",
        message="Message",
    )

    response = landlord_client(landlord).patch(
        f"/api/v1/notifications/{notification.id}/",
        {"is_read": True},
        format="json",
    )
    assert response.status_code == 200
    notification.refresh_from_db()
    assert notification.is_read is True


@pytest.mark.django_db
def test_approving_landlord_creates_notification(make_landlord, agent_client):
    landlord = make_landlord()
    response = agent_client.patch(
        f"/api/v1/dashboard/landlords/{landlord.id}/verification/",
        {"verification_status": "approved"},
        format="json",
    )
    assert response.status_code == 200
    assert Notification.objects.filter(
        recipient_type="landlord",
        recipient_id=landlord.id,
        title="Identity verified",
    ).count() == 1


@pytest.mark.django_db
def test_rejecting_intake_creates_notification(make_landlord, agent_client):
    from apps.landlords.models import PropertyIntake

    landlord = make_landlord()
    intake = PropertyIntake.objects.create(
        landlord=landlord,
        title="2-bed flat",
        property_type="flat",
        price=50000000,
        address="1 Test Street",
        city="Lagos",
        state="Lagos",
        area="Yaba",
        bedrooms=2,
        bathrooms=2,
        toilets=2,
    )
    response = agent_client.patch(
        f"/api/v1/dashboard/intakes/{intake.id}/",
        {"status": "rejected"},
        format="json",
    )
    assert response.status_code == 200
    assert Notification.objects.filter(
        recipient_type="landlord",
        recipient_id=landlord.id,
        title="Listing needs attention",
    ).count() == 1
