import pytest

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.landlords.models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from apps.crm.models import ConciergeLead
from apps.dashboard.models import AgentProfile

User = get_user_model()


@pytest.fixture
def make_agent():
    def _make(phone="08050000000", role="agent", **overrides):
        user = User.objects.create_user(username=phone, password="testpass123")
        data = {
            "user": user,
            "phone": phone,
            "full_name": "Test Agent",
            "role": role,
        }
        data.update(overrides)
        return AgentProfile.objects.create(**data)
    return _make


@pytest.fixture
def agent_client(make_agent):
    agent = make_agent()
    client = APIClient()
    client.force_authenticate(user=agent.user)
    return client


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
def test_dashboard_summary_empty(agent_client):
    response = agent_client.get("/api/v1/dashboard/summary/")
    assert response.status_code == 200
    data = response.data["data"]
    assert data["total_landlords"] == 0
    assert data["total_intakes"] == 0
    assert data["total_appointments"] == 0
    assert data["total_concierge_leads"] == 0


@pytest.mark.django_db
def test_dashboard_summary_counts(make_landlord, agent_client):
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

    response = agent_client.get("/api/v1/dashboard/summary/")
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
def test_dashboard_landlords_include_counts(make_landlord, agent_client):
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

    response = agent_client.get("/api/v1/dashboard/landlords/")
    assert response.status_code == 200
    data = response.data["data"]
    assert len(data) == 1
    assert data[0]["intake_count"] == 1
    assert data[0]["appointment_count"] == 1


@pytest.mark.django_db
def test_dashboard_intakes_include_landlord_details(make_landlord, agent_client):
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

    response = agent_client.get("/api/v1/dashboard/intakes/")
    assert response.status_code == 200
    data = response.data["data"]
    assert len(data) == 1
    assert data[0]["landlord_name"] == "Test Landlord"
    assert data[0]["landlord_phone"] == "08012345678"


@pytest.mark.django_db
def test_dashboard_appointments_include_landlord_details(make_landlord, agent_client):
    landlord = make_landlord()
    Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-03",
        time_slot="09:00 AM",
        tour_type="virtual",
    )

    response = agent_client.get("/api/v1/dashboard/appointments/")
    assert response.status_code == 200
    data = response.data["data"]
    assert len(data) == 1
    assert data[0]["landlord_name"] == "Test Landlord"
    assert data[0]["time_slot"] == "09:00 AM"


@pytest.mark.django_db
def test_update_landlord_verification(make_landlord, agent_client):
    landlord = make_landlord()
    assert landlord.verification_status == "pending"

    response = agent_client.patch(
        f"/api/v1/dashboard/landlords/{landlord.id}/verification/",
        {"verification_status": "approved"},
        format="json",
    )
    assert response.status_code == 200
    landlord.refresh_from_db()
    assert landlord.verification_status == "approved"


@pytest.mark.django_db
def test_update_landlord_verification_invalid(make_landlord, agent_client):
    landlord = make_landlord()
    response = agent_client.patch(
        f"/api/v1/dashboard/landlords/{landlord.id}/verification/",
        {"verification_status": "not_a_status"},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_update_landlord_verification_not_found(agent_client):
    import uuid
    response = agent_client.patch(
        f"/api/v1/dashboard/landlords/{uuid.uuid4()}/verification/",
        {"verification_status": "approved"},
        format="json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_update_intake_status(make_landlord, agent_client):
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

    response = agent_client.patch(
        f"/api/v1/dashboard/intakes/{intake.id}/",
        {"status": "approved"},
        format="json",
    )
    assert response.status_code == 200
    intake.refresh_from_db()
    assert intake.status == "approved"


@pytest.mark.django_db
def test_update_appointment_status_and_reschedule(make_landlord, agent_client):
    landlord = make_landlord()
    appointment = Appointment.objects.create(
        landlord=landlord,
        preferred_date="2026-09-10",
        time_slot="09:00 AM",
        tour_type="in_person",
    )

    response = agent_client.patch(
        f"/api/v1/dashboard/appointments/{appointment.id}/",
        {"status": "confirmed"},
        format="json",
    )
    assert response.status_code == 200
    appointment.refresh_from_db()
    assert appointment.status == "confirmed"

    response = agent_client.patch(
        f"/api/v1/dashboard/appointments/{appointment.id}/",
        {"preferred_date": "2026-09-11", "time_slot": "02:00 PM"},
        format="json",
    )
    assert response.status_code == 200
    appointment.refresh_from_db()
    assert appointment.preferred_date.isoformat() == "2026-09-11"
    assert appointment.time_slot == "02:00 PM"


@pytest.mark.django_db
def test_update_appointment_conflict_rejected(make_landlord, agent_client):
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

    response = agent_client.patch(
        f"/api/v1/dashboard/appointments/{other.id}/",
        {"preferred_date": "2026-09-10", "time_slot": "09:00 AM"},
        format="json",
    )
    assert response.status_code == 400
    other.refresh_from_db()
    assert other.preferred_date.isoformat() == "2026-09-12"


@pytest.mark.django_db
def test_dashboard_summary_lead_scoring_counts(agent_client):
    from apps.crm.models import LeadScore

    lead = ConciergeLead.objects.create(
        full_name="Hot Buyer",
        phone="08099887766",
        preferred_location="Ikoyi",
        budget_max=300000000,
    )
    LeadScore.objects.create(
        lead=lead,
        total_score=95,
        tier="HOT",
        budget_match_score=40,
        location_match_score=30,
        completeness_score=15,
        property_type_match_score=5,
        bedrooms_match_score=5,
        urgency_score=0,
    )
    lead.sla_breached_at = "2026-08-01T10:00:00Z"
    lead.save()

    response = agent_client.get("/api/v1/dashboard/summary/")
    assert response.status_code == 200
    data = response.data["data"]
    assert data["leads_hot"] == 1
    assert data["leads_warm"] == 0
    assert data["leads_cold"] == 0
    assert data["leads_sla_breached"] == 1


@pytest.mark.django_db
def test_dashboard_leads_list_ordered_by_score(agent_client):
    from apps.crm.models import LeadScore

    hot = ConciergeLead.objects.create(
        full_name="Hot Buyer",
        phone="08099887766",
        preferred_location="Ikoyi",
        budget_max=300000000,
    )
    cold = ConciergeLead.objects.create(
        full_name="Cold Buyer",
        phone="08011223344",
        preferred_location="Rural Area",
        budget_max=10000000,
    )
    LeadScore.objects.create(lead=hot, total_score=95, tier="HOT")
    LeadScore.objects.create(lead=cold, total_score=20, tier="COLD")

    response = agent_client.get("/api/v1/dashboard/leads/")
    assert response.status_code == 200
    leads = response.data["data"]
    assert len(leads) == 2
    assert leads[0]["id"] == str(hot.id)
    assert leads[0]["tier"] == "HOT"
    assert leads[0]["priority_score"] == 95
    assert leads[1]["id"] == str(cold.id)


@pytest.mark.django_db
def test_dashboard_requires_authentication():
    response = APIClient().get("/api/v1/dashboard/summary/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_dashboard_requires_agent_role(make_agent):
    from apps.landlords.models import LandlordProfile

    LandlordProfile.objects.create(
        full_name="Test Landlord",
        phone="08012345678",
        email="landlord@example.com",
        id_type="nin",
        id_number="12345678901",
        property_count=1,
        ndpr_consent=True,
    )

    # A plain authenticated user (no AgentProfile) is forbidden
    user = User.objects.create_user(username="plainuser", password="testpass123")
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get("/api/v1/dashboard/summary/")
    assert response.status_code == 403

    # An active agent is allowed
    agent_client = APIClient()
    agent_client.force_authenticate(user=make_agent().user)
    response = agent_client.get("/api/v1/dashboard/summary/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_inactive_agent_forbidden(make_agent):
    agent = make_agent()
    agent.is_active = False
    agent.save()

    client = APIClient()
    client.force_authenticate(user=agent.user)
    response = client.get("/api/v1/dashboard/landlords/")
    assert response.status_code == 403


def _make_document(landlord, doc_type="title_deed"):
    return DocumentVault.objects.create(
        landlord=landlord,
        doc_type=doc_type,
        file=SimpleUploadedFile("proof.pdf", b"dummy-file-content", content_type="application/pdf"),
    )


@pytest.mark.django_db
def test_dashboard_documents_list(make_landlord, agent_client):
    landlord = make_landlord()
    _make_document(landlord)
    _make_document(landlord, doc_type="government_id")

    response = agent_client.get("/api/v1/dashboard/documents/")
    assert response.status_code == 200
    assert len(response.data["data"]) == 2
    assert response.data["data"][0]["landlord_name"] == "Test Landlord"
    assert response.data["data"][0]["file_url"]


@pytest.mark.django_db
def test_dashboard_documents_require_agent():
    user = User.objects.create_user(username="plainuser2", password="testpass123")
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get("/api/v1/dashboard/documents/")
    assert response.status_code == 403


@pytest.mark.django_db
def test_review_document_approved(make_landlord, agent_client):
    landlord = make_landlord()
    document = _make_document(landlord)

    response = agent_client.patch(
        f"/api/v1/dashboard/documents/{document.id}/",
        {"review_status": "approved", "review_notes": "Looks legitimate"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["data"]["review_status"] == "approved"
    document.refresh_from_db()
    assert document.reviewed_at is not None


@pytest.mark.django_db
def test_review_document_rejected_invalid_status(make_landlord, agent_client):
    landlord = make_landlord()
    document = _make_document(landlord)

    response = agent_client.patch(
        f"/api/v1/dashboard/documents/{document.id}/",
        {"review_status": "maybe"},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_review_document_not_found(agent_client):
    response = agent_client.patch(
        "/api/v1/dashboard/documents/00000000-0000-0000-0000-000000000000/",
        {"review_status": "approved"},
        format="json",
    )
    assert response.status_code == 404



