import pytest

from rest_framework.test import APIClient

from apps.landlords.models import LandlordProfile, PropertyIntake, Appointment
from apps.crm.models import ConciergeLead


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


@pytest.mark.django_db
def test_dashboard_summary_empty():
    response = APIClient().get("/api/v1/dashboard/summary/")
    assert response.status_code == 200
    data = response.data["data"]
    assert data["total_landlords"] == 0
    assert data["total_intakes"] == 0
    assert data["total_appointments"] == 0
    assert data["total_concierge_leads"] == 0


@pytest.mark.django_db
def test_dashboard_summary_counts(make_landlord):
    landlord = make_landlord()
    PropertyIntake.objects.create(
        landlord=landlord,
        title="3-bed flat in Lekki",
        property_type="flat",
        price=85000000,
        address="12 Admiralty Way",
        city="Lagos",
        state="Lagos",
        area="Lekki Phase 1",
        bedrooms=3,
        bathrooms=2,
        toilets=2,
        status="submitted",
    )
    Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-01",
        time_slot="11:00 AM",
        tour_type="virtual",
        status="pending",
    )
    ConciergeLead.objects.create(
        full_name="Jane Buyer",
        phone="08123456789",
        preferred_location="Ikoyi",
        budget_max=100000000,
    )

    response = APIClient().get("/api/v1/dashboard/summary/")
    assert response.status_code == 200
    data = response.data["data"]
    assert data["total_landlords"] == 1
    assert data["landlords_pending_verification"] == 1
    assert data["total_intakes"] == 1
    assert data["intakes_submitted"] == 1
    assert data["total_appointments"] == 1
    assert data["appointments_pending"] == 1
    assert data["total_concierge_leads"] == 1
    assert data["leads_new_7d"] == 1


@pytest.mark.django_db
def test_dashboard_landlords_include_counts(make_landlord):
    landlord = make_landlord()
    PropertyIntake.objects.create(
        landlord=landlord,
        title="4-bed duplex",
        property_type="fully_detached_duplex",
        price=250000000,
        address="1 Riverside",
        city="Abuja",
        state="FCT",
        area="Maitama",
        bedrooms=4,
        bathrooms=4,
        toilets=4,
    )
    Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-02",
        time_slot="02:00 PM",
        tour_type="in_person",
    )

    response = APIClient().get("/api/v1/dashboard/landlords/")
    assert response.status_code == 200
    data = response.data["data"]
    assert len(data) == 1
    assert data[0]["intake_count"] == 1
    assert data[0]["appointment_count"] == 1


@pytest.mark.django_db
def test_dashboard_intakes_include_landlord_details(make_landlord):
    landlord = make_landlord()
    PropertyIntake.objects.create(
        landlord=landlord,
        title="Studio in Yaba",
        property_type="self_contain",
        price=1500000,
        address="3 Hughes Ave",
        city="Lagos",
        state="Lagos",
        area="Yaba",
        bedrooms=1,
        bathrooms=1,
        toilets=1,
    )

    response = APIClient().get("/api/v1/dashboard/intakes/")
    assert response.status_code == 200
    data = response.data["data"]
    assert len(data) == 1
    assert data[0]["landlord_name"] == "Test Landlord"
    assert data[0]["landlord_phone"] == "08012345678"


@pytest.mark.django_db
def test_dashboard_appointments_include_landlord_details(make_landlord):
    landlord = make_landlord()
    Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-03",
        time_slot="09:00 AM",
        tour_type="virtual",
    )

    response = APIClient().get("/api/v1/dashboard/appointments/")
    assert response.status_code == 200
    data = response.data["data"]
    assert len(data) == 1
    assert data[0]["landlord_name"] == "Test Landlord"
    assert data[0]["time_slot"] == "09:00 AM"


@pytest.mark.django_db
def test_update_landlord_verification(make_landlord):
    landlord = make_landlord()
    assert landlord.verification_status == "pending"

    response = APIClient().patch(
        f"/api/v1/dashboard/landlords/{landlord.id}/verification/",
        {"verification_status": "approved"},
        format="json",
    )
    assert response.status_code == 200
    landlord.refresh_from_db()
    assert landlord.verification_status == "approved"


@pytest.mark.django_db
def test_update_landlord_verification_invalid(make_landlord):
    landlord = make_landlord()
    response = APIClient().patch(
        f"/api/v1/dashboard/landlords/{landlord.id}/verification/",
        {"verification_status": "not_a_status"},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_update_landlord_verification_not_found():
    import uuid
    response = APIClient().patch(
        f"/api/v1/dashboard/landlords/{uuid.uuid4()}/verification/",
        {"verification_status": "approved"},
        format="json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_update_intake_status(make_landlord):
    landlord = make_landlord()
    intake = PropertyIntake.objects.create(
        landlord=landlord,
        title="3-bed flat",
        property_type="flat",
        price=85000000,
        address="12 Admiralty Way",
        city="Lagos",
        state="Lagos",
        area="Lekki Phase 1",
        bedrooms=3,
        bathrooms=2,
        toilets=2,
    )
    assert intake.status == "draft"

    response = APIClient().patch(
        f"/api/v1/dashboard/intakes/{intake.id}/",
        {"status": "approved"},
        format="json",
    )
    assert response.status_code == 200
    intake.refresh_from_db()
    assert intake.status == "approved"


@pytest.mark.django_db
def test_update_appointment_status_and_reschedule(make_landlord):
    landlord = make_landlord()
    appointment = Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-10",
        time_slot="09:00 AM",
        tour_type="in_person",
    )

    response = APIClient().patch(
        f"/api/v1/dashboard/appointments/{appointment.id}/",
        {"status": "confirmed"},
        format="json",
    )
    assert response.status_code == 200
    appointment.refresh_from_db()
    assert appointment.status == "confirmed"

    response = APIClient().patch(
        f"/api/v1/dashboard/appointments/{appointment.id}/",
        {"preferred_date": "2026-09-11", "time_slot": "02:00 PM"},
        format="json",
    )
    assert response.status_code == 200
    appointment.refresh_from_db()
    assert appointment.preferred_date.isoformat() == "2026-09-11"
    assert appointment.time_slot == "02:00 PM"


@pytest.mark.django_db
def test_update_appointment_conflict_rejected(make_landlord):
    landlord = make_landlord()
    existing = Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-10",
        time_slot="09:00 AM",
        tour_type="virtual",
    )
    other = Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-12",
        time_slot="11:00 AM",
        tour_type="in_person",
    )

    response = APIClient().patch(
        f"/api/v1/dashboard/appointments/{other.id}/",
        {"preferred_date": "2026-09-10", "time_slot": "09:00 AM"},
        format="json",
    )
    assert response.status_code == 400
    other.refresh_from_db()
    assert other.preferred_date.isoformat() == "2026-09-12"
