from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.crm.models import ConciergeLead, LeadScore, SLAAlert
from apps.crm.services import LeadScoringService, SLAAlertService
from apps.notifications.models import Notification

pytestmark = pytest.mark.django_db


def make_lead(**overrides):
    data = {
        "full_name": "Test Buyer",
        "phone": "08012345678",
        "preferred_location": "Ikoyi",
        "budget_max": 250000000,
        "property_type": "house_duplex",
        "bedrooms": "4",
    }
    data.update(overrides)
    return ConciergeLead.objects.create(**data)


class TestLeadScoringService:
    def test_calculate_score_persists_breakdown(self):
        lead = make_lead()
        result = LeadScoringService.if_needed_score_lead(lead)

        assert result["tier"] == "HOT"
        assert result["score"] >= 75

        score = LeadScore.objects.get(lead=lead)
        assert score.tier == "HOT"
        assert score.total_score == result["score"]
        assert score.budget_match_score == 40
        assert score.location_match_score == 30
        assert score.completeness_score == 15
        assert score.property_type_match_score == 10
        assert score.bedrooms_match_score == 10

    def test_cold_lead_low_budget_unknown_location(self):
        lead = make_lead(
            budget_max=30000000,
            preferred_location="Rural Area",
            property_type="any",
            bedrooms="any",
            phone="",
            email=None,
        )
        result = LeadScoringService.calculate_score(lead)
        assert result["tier"] == "COLD"
        assert result["score"] < 45

    def test_persist_score_is_idempotent(self):
        lead = make_lead()
        LeadScoringService.if_needed_score_lead(lead)
        LeadScoringService.if_needed_score_lead(lead)
        assert LeadScore.objects.filter(lead=lead).count() == 1


class TestSLAAlertService:
    def test_breached_lead_creates_alert_and_notification(self):
        lead = make_lead()
        lead.start_sla_clock()
        lead.sla_deadline = timezone.now() - timedelta(hours=3)
        lead.save(update_fields=["sla_deadline"])

        breached = SLAAlertService.check_overdue_leads()

        assert len(breached) == 1
        lead.refresh_from_db()
        assert lead.is_sla_breached is True
        assert SLAAlert.objects.filter(lead=lead, severity="critical").count() == 1
        assert Notification.objects.filter(recipient_type="agent", title__icontains="SLA").count() == 1

    def test_fresh_lead_not_flagged(self):
        lead = make_lead()
        lead.start_sla_clock()

        breached = SLAAlertService.check_overdue_leads()

        assert breached == []
        lead.refresh_from_db()
        assert lead.is_sla_breached is False

    def test_no_duplicate_alerts_on_recheck(self):
        lead = make_lead()
        lead.start_sla_clock()
        lead.sla_deadline = timezone.now() - timedelta(hours=3)
        lead.save(update_fields=["sla_deadline"])

        SLAAlertService.check_overdue_leads()
        SLAAlertService.check_overdue_leads()

        assert SLAAlert.objects.filter(lead=lead).count() == 1


class TestSubmitConciergeLeadView:
    def test_lead_created_with_score_and_sla(self):
        client = APIClient()
        response = client.post(
            "/api/v1/crm/submit-concierge/",
            {
                "full_name": "Buyer One",
                "phone": "+2348012345678",
                "preferred_location": "Lekki Phase 1",
                "property_type": "flat_apartment",
                "budget_min": 50000000,
                "budget_max": 120000000,
                "bedrooms": "3",
                "ndpr_consent": True,
            },
            format="json",
        )

        assert response.status_code == 201
        data = response.data["data"]
        assert "priority_score" in data
        assert data["tier"] in {"HOT", "WARM", "COLD"}
        assert data["sla_deadline"] is not None

        lead = ConciergeLead.objects.get(id=data["id"])
        assert lead.sla_deadline is not None
        assert lead.sla_remaining_minutes is not None
        assert lead.sla_remaining_minutes > 0
        assert LeadScore.objects.filter(lead=lead).exists()


class TestPropertyInquiryView:
    def _make_property(self):
        from apps.properties.models import Property
        return Property.objects.create(
            title="4 Bedroom Duplex in Lekki",
            description="Modern duplex in a gated estate.",
            property_type="fully_detached_duplex",
            price="250000000",
            address="12 Admiralty Way",
            city="Lekki",
            state="Lagos",
            area="Lekki Phase 1",
            bedrooms=4,
            bathrooms=5,
            toilets=5,
            status="available",
        )

    def valid_payload(self):
        return {
            "full_name": "Interested Buyer",
            "phone": "08123456789",
            "email": "buyer@test.com",
            "inquiry_message": "Please share more details and arrange a viewing.",
            "ndpr_consent": True,
        }

    def test_inquiry_creates_lead_tied_to_listing(self):
        prop = self._make_property()
        response = APIClient().post(
            f"/api/v1/properties/properties/{prop.id}/inquiries/",
            self.valid_payload(),
            format="json",
        )

        assert response.status_code == 201
        data = response.data["data"]
        assert data["property_title"] == prop.title
        assert data["tier"] in {"HOT", "WARM", "COLD"}

        lead = ConciergeLead.objects.get(id=data["id"])
        assert lead.listing == prop
        assert lead.preferred_location == "Lekki Phase 1, Lekki, Lagos"
        assert lead.property_type == "house_duplex"
        assert lead.budget_max == 250000000
        assert lead.sla_deadline is not None

    def test_inquiry_missing_consent_rejected(self):
        prop = self._make_property()
        payload = {k: v for k, v in self.valid_payload().items() if k != "ndpr_consent"}
        response = APIClient().post(
            f"/api/v1/properties/properties/{prop.id}/inquiries/",
            payload,
            format="json",
        )
        assert response.status_code == 400
        assert "ndpr_consent" in response.data["errors"]
        assert ConciergeLead.objects.count() == 0

    def test_inquiry_invalid_phone_rejected(self):
        prop = self._make_property()
        payload = {**self.valid_payload(), "phone": "123"}
        response = APIClient().post(
            f"/api/v1/properties/properties/{prop.id}/inquiries/",
            payload,
            format="json",
        )
        assert response.status_code == 400
        assert "phone" in response.data["errors"]

    def test_inquiry_missing_message_rejected(self):
        prop = self._make_property()
        payload = {k: v for k, v in self.valid_payload().items() if k != "inquiry_message"}
        response = APIClient().post(
            f"/api/v1/properties/properties/{prop.id}/inquiries/",
            payload,
            format="json",
        )
        assert response.status_code == 400
        assert "inquiry_message" in response.data["errors"]

    def test_inquiry_unknown_listing_404(self):
        response = APIClient().post(
            "/api/v1/properties/properties/00000000-0000-0000-0000-000000000000/inquiries/",
            self.valid_payload(),
            format="json",
        )
        assert response.status_code == 404
