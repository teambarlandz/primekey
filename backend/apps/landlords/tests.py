import pytest
from rest_framework.test import APIClient

from .models import LandlordProfile

pytestmark = pytest.mark.django_db


VALID_PAYLOAD = {
    "full_name": "Test Landlord",
    "phone": "08012345678",
    "email": "landlord@test.com",
    "id_type": "nin",
    "id_number": "12345678901",
    "property_count": 1,
    "ndpr_consent": True,
}


class TestLandlordRegistration:
    def test_registration_with_consent_creates_pending_profile(self):
        client = APIClient()
        response = client.post("/api/v1/landlords/register/", VALID_PAYLOAD, format="json")

        assert response.status_code == 201
        assert response.data["data"]["verification_status"] == "pending"
        assert LandlordProfile.objects.count() == 1

    def test_registration_missing_consent_rejected(self):
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "ndpr_consent"}
        response = APIClient().post("/api/v1/landlords/register/", payload, format="json")

        assert response.status_code == 400
        assert "ndpr_consent" in response.data["errors"]
        assert LandlordProfile.objects.count() == 0

    def test_registration_false_consent_rejected(self):
        payload = {**VALID_PAYLOAD, "ndpr_consent": False}
        response = APIClient().post("/api/v1/landlords/register/", payload, format="json")

        assert response.status_code == 400
        assert LandlordProfile.objects.count() == 0

    def test_registration_invalid_phone_rejected(self):
        payload = {**VALID_PAYLOAD, "phone": "123"}
        response = APIClient().post("/api/v1/landlords/register/", payload, format="json")

        assert response.status_code == 400
        assert LandlordProfile.objects.count() == 0


class TestAppointmentCreation:
    def test_appointment_requires_landlord(self):
        response = APIClient().post(
            "/api/v1/landlords/appointments/",
            {
                "preferred_date": "2026-09-01",
                "time_slot": "10:00",
                "tour_type": "virtual",
            },
            format="json",
        )

        assert response.status_code == 400
