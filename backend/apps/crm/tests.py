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
