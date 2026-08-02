import pytest
from rest_framework.test import APIClient

from .models import LandlordProfile, PropertyIntake, Appointment, DocumentVault

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


def make_landlord(**overrides):
    data = {**VALID_PAYLOAD}
    data.update(overrides)
    return LandlordProfile.objects.create(**data)


def valid_intake_payload(landlord_id):
    return {
        "landlord": str(landlord_id),
        "title": "4 Bedroom Duplex in Lekki",
        "property_type": "fully_detached_duplex",
        "price": "250000000",
        "is_negotiable": True,
        "address": "12 Admiralty Way",
        "city": "Lekki",
        "state": "Lagos",
        "area": "Lekki Phase 1",
        "bedrooms": 4,
        "bathrooms": 5,
        "toilets": 5,
        "description": "Fully detached duplex with Boys' Quarters.",
    }


def valid_appointment_payload(landlord_id):
    return {
        "landlord": str(landlord_id),
        "preferred_date": "2026-09-01",
        "time_slot": "11:00 AM",
        "tour_type": "virtual",
        "notes": "Please call before visiting.",
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


class TestPropertyIntake:
    def test_valid_intake_created_as_submitted(self):
        landlord = make_landlord()
        response = APIClient().post(
            "/api/v1/landlords/intakes/",
            valid_intake_payload(landlord.id),
            format="json",
        )

        assert response.status_code == 201
        assert response.data["data"]["status"] == "submitted"
        assert PropertyIntake.objects.count() == 1
        assert PropertyIntake.objects.first().landlord == landlord

    def test_intake_requires_landlord(self):
        payload = valid_intake_payload("00000000-0000-0000-0000-000000000000")
        response = APIClient().post("/api/v1/landlords/intakes/", payload, format="json")

        assert response.status_code == 400
        assert "landlord" in response.data["errors"]
        assert PropertyIntake.objects.count() == 0

    def test_intake_price_must_be_positive(self):
        landlord = make_landlord()
        payload = valid_intake_payload(landlord.id)
        payload["price"] = "0"
        response = APIClient().post("/api/v1/landlords/intakes/", payload, format="json")

        assert response.status_code == 400
        assert "price" in response.data["errors"]
        assert PropertyIntake.objects.count() == 0

    def test_intake_bedrooms_at_least_one(self):
        landlord = make_landlord()
        payload = valid_intake_payload(landlord.id)
        payload["bedrooms"] = 0
        response = APIClient().post("/api/v1/landlords/intakes/", payload, format="json")

        assert response.status_code == 400
        assert "bedrooms" in response.data["errors"]
        assert PropertyIntake.objects.count() == 0

    def test_intake_bathrooms_at_least_one(self):
        landlord = make_landlord()
        payload = valid_intake_payload(landlord.id)
        payload["bathrooms"] = 0
        response = APIClient().post("/api/v1/landlords/intakes/", payload, format="json")

        assert response.status_code == 400
        assert "bathrooms" in response.data["errors"]
        assert PropertyIntake.objects.count() == 0


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

    def test_valid_appointment_created(self):
        landlord = make_landlord()
        response = APIClient().post(
            "/api/v1/landlords/appointments/",
            valid_appointment_payload(landlord.id),
            format="json",
        )

        assert response.status_code == 201
        assert response.data["data"]["status"] == "pending"
        assert Appointment.objects.count() == 1

    def test_appointment_past_date_rejected(self):
        landlord = make_landlord()
        payload = valid_appointment_payload(landlord.id)
        payload["preferred_date"] = "2020-01-01"
        response = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")

        assert response.status_code == 400
        assert "preferred_date" in response.data["errors"]
        assert Appointment.objects.count() == 0

    def test_appointment_invalid_time_slot_rejected(self):
        landlord = make_landlord()
        payload = valid_appointment_payload(landlord.id)
        payload["time_slot"] = "03:00"
        response = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")

        assert response.status_code == 400
        assert "time_slot" in response.data["errors"]
        assert Appointment.objects.count() == 0

    def test_appointment_invalid_tour_type_rejected(self):
        landlord = make_landlord()
        payload = valid_appointment_payload(landlord.id)
        payload["tour_type"] = "teleport"
        response = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")

        assert response.status_code == 400
        assert "tour_type" in response.data["errors"]
        assert Appointment.objects.count() == 0

    def test_appointment_duplicate_slot_rejected(self):
        landlord = make_landlord()
        payload = valid_appointment_payload(landlord.id)

        first = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")
        assert first.status_code == 201

        second = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")
        assert second.status_code == 400
        assert "time_slot" in second.data["errors"]
        assert Appointment.objects.count() == 1

    def test_appointment_duplicate_allowed_when_cancelled(self):
        landlord = make_landlord()
        payload = valid_appointment_payload(landlord.id)

        first = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")
        assert first.status_code == 201

        first.data["data"]["status"] = "cancelled"
        Appointment.objects.filter(pk=first.data["data"]["id"]).update(status="cancelled")

        second = APIClient().post("/api/v1/landlords/appointments/", payload, format="json")
        assert second.status_code == 201
        assert Appointment.objects.count() == 2

    def test_appointment_reschedule_to_conflicting_slot_rejected(self):
        landlord = make_landlord()
        first = APIClient().post(
            "/api/v1/landlords/appointments/",
            valid_appointment_payload(landlord.id),
            format="json",
        )
        assert first.status_code == 201

        other = APIClient().post(
            "/api/v1/landlords/appointments/",
            {
                **valid_appointment_payload(landlord.id),
                "preferred_date": "2026-09-03",
                "time_slot": "02:00 PM",
            },
            format="json",
        )
        assert other.status_code == 201
        other_id = other.data["data"]["id"]

        reschedule = APIClient().patch(
            f"/api/v1/landlords/appointments/{other_id}/",
            {"preferred_date": "2026-09-01", "time_slot": "11:00 AM"},
            format="json",
        )
        assert reschedule.status_code == 400

    def test_appointment_update_rejects_unknown_field(self):
        landlord = make_landlord()
        appointment = APIClient().post(
            "/api/v1/landlords/appointments/",
            valid_appointment_payload(landlord.id),
            format="json",
        )
        assert appointment.status_code == 201
        appointment_id = appointment.data["data"]["id"]

        response = APIClient().patch(
            f"/api/v1/landlords/appointments/{appointment_id}/",
            {"tour_type": "in_person"},
            format="json",
        )
        assert response.status_code == 400

    def test_appointment_list_for_landlord(self):
        landlord = make_landlord()
        APIClient().post(
            "/api/v1/landlords/appointments/",
            valid_appointment_payload(landlord.id),
            format="json",
        )
        APIClient().post(
            "/api/v1/landlords/appointments/",
            {
                **valid_appointment_payload(landlord.id),
                "preferred_date": "2026-09-04",
                "time_slot": "04:00 PM",
            },
            format="json",
        )

        response = APIClient().get(f"/api/v1/landlords/landlords/{landlord.id}/appointments/")
        assert response.status_code == 200
        assert len(response.data["data"]) == 2


class TestDocumentVault:
    def _upload(self, landlord_id, **overrides):
        payload = {
            "landlord_id": str(landlord_id),
            "doc_type": "title_deed",
        }
        payload.update(overrides)
        return APIClient().post(
            "/api/v1/landlords/documents/",
            payload,
            format="multipart",
        )

    def test_upload_document_creates_pending_entry(self):
        landlord = make_landlord()
        with open(__file__, "rb") as f:
            response = self._upload(landlord.id, file=f)

        assert response.status_code == 201
        assert response.data["data"]["review_status"] == "pending"
        assert response.data["data"]["file_url"]
        assert DocumentVault.objects.count() == 1

    def test_upload_requires_landlord(self):
        response = APIClient().post("/api/v1/landlords/documents/", {}, format="multipart")
        assert response.status_code == 400
        assert "landlord_id" in response.data["errors"]

    def test_upload_unknown_landlord_404(self):
        response = self._upload("00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404

    def test_upload_intake_must_belong_to_landlord(self):
        landlord = make_landlord()
        other = make_landlord(full_name="Other Landlord", phone="09087654321", email="other@test.com")
        intake = PropertyIntake.objects.create(
            landlord=other,
            title="Other Property",
            property_type="fully_detached_duplex",
            price="200000000",
            address="5 Test Road",
            city="Ikeja",
            state="Lagos",
            area="GRA",
        )
        with open(__file__, "rb") as f:
            response = self._upload(landlord.id, intake_id=str(intake.id), file=f)
        assert response.status_code == 400
        assert "intake_id" in response.data["errors"]

    def test_document_list_for_landlord(self):
        landlord = make_landlord()
        with open(__file__, "rb") as f:
            self._upload(landlord.id, file=f)
        with open(__file__, "rb") as f:
            self._upload(landlord.id, doc_type="government_id", file=f)

        response = APIClient().get(f"/api/v1/landlords/landlords/{landlord.id}/documents/")
        assert response.status_code == 200
        assert len(response.data["data"]) == 2

    def test_document_list_unknown_landlord_404(self):
        response = APIClient().get("/api/v1/landlords/landlords/00000000-0000-0000-0000-000000000000/documents/")
        assert response.status_code == 404
