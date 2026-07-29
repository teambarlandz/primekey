import pytest
import uuid
import re
from datetime import timedelta
from django.utils import timezone
from django.test import RequestFactory
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import ConciergeLead, ConsentLog, LeadScore, SLAAlert
from .serializers import (
    ConciergeLeadSerializer, ConsentLogSerializer,
    NIGERIAN_PHONE_REGEX
)
from .services import LeadScoringService, SLAAlertService
from .views import (
    SubmitConciergeLeadView, ConciergeLeadListView,
    ConciergeLeadDetailView, RecalculateLeadScoreView,
    SLAAlertListView, SLAAlertAcknowledgeView, ConsentLogListView
)
from apps.properties.models import Property


# =====================================================================
# FACTORIES
# =====================================================================

class ConciergeLeadFactory:
    @staticmethod
    def build_attributes(overrides=None):
        data = {
            'full_name': 'Test User',
            'phone': '08031234567',
            'email': 'test@example.com',
            'preferred_location': 'Lekki',
            'property_type': 'flat_apartment',
            'budget_min': 50_000_000,
            'budget_max': 150_000_000,
            'bedrooms': '3',
            'ndpr_consent': True,
        }
        if overrides:
            data.update(overrides)
        return data

    @staticmethod
    def create(overrides=None):
        return ConciergeLead.objects.create(**ConciergeLeadFactory.build_attributes(overrides))


class PropertyFactory:
    @staticmethod
    def create(overrides=None):
        data = {
            'title': 'Test Property',
            'description': 'A nice property',
            'property_type': 'flat',
            'price': 80_000_000,
            'address': '123 Test St',
            'city': 'Lekki',
            'state': 'Lagos',
            'area': 'Lekki Phase 1',
            'bedrooms': 3,
            'bathrooms': 2,
            'toilets': 2,
            'status': 'available',
        }
        if overrides:
            data.update(overrides)
        return Property.objects.create(**data)


# =====================================================================
# MODEL TESTS
# =====================================================================

class TestConciergeLeadModel:
    def test_create_lead(self, db):
        lead = ConciergeLeadFactory.create()
        assert lead.full_name == 'Test User'
        assert lead.phone == '08031234567'
        assert lead.status == 'active_sla_queue'
        assert isinstance(lead.id, uuid.UUID)

    def test_sla_deadline_set_on_create(self, db):
        lead = ConciergeLeadFactory.create()
        assert lead.sla_deadline is not None
        remaining = lead.sla_remaining_minutes
        assert 115 <= remaining <= 120

    def test_is_sla_breached(self, db):
        lead = ConciergeLeadFactory.create()
        assert not lead.is_sla_breached
        lead.sla_deadline = timezone.now() - timedelta(hours=1)
        lead.save(update_fields=['sla_deadline'])
        assert lead.is_sla_breached

    def test_sla_breached_not_for_closed(self, db):
        lead = ConciergeLeadFactory.create({'status': 'closed_won'})
        lead.sla_deadline = timezone.now() - timedelta(hours=1)
        lead.save(update_fields=['sla_deadline', 'status'])
        assert not lead.is_sla_breached

    def test_str_representation(self, db):
        lead = ConciergeLeadFactory.create()
        assert str(lead) == 'Test User - Lekki (08031234567)'

    def test_ordering(self, db):
        ConciergeLeadFactory.create({'full_name': 'A'})
        ConciergeLeadFactory.create({'full_name': 'B'})
        qs = ConciergeLead.objects.all()
        assert qs[0].full_name == 'B'
        assert qs[1].full_name == 'A'


class TestConsentLogModel:
    def test_create_consent_log(self, db):
        lead = ConciergeLeadFactory.create()
        log = ConsentLog.objects.create(
            lead=lead,
            ip_address='127.0.0.1',
            user_agent='test-agent'
        )
        assert log.lead == lead
        assert log.consent_text is not None
        assert isinstance(log.id, uuid.UUID)


class TestLeadScoreModel:
    def test_create_lead_score(self, db):
        lead = ConciergeLeadFactory.create()
        score = LeadScore.objects.create(
            lead=lead,
            total_score=85,
            budget_match_score=20,
            location_match_score=15,
            property_type_match_score=10,
            bedrooms_match_score=10,
            completeness_score=15,
            urgency_score=15,
        )
        assert score.total_score == 85
        assert str(score).startswith('Score for')


class TestSLAAlertModel:
    def test_create_alert(self, db):
        lead = ConciergeLeadFactory.create()
        alert = SLAAlert.objects.create(
            lead=lead,
            severity='warning',
            message='Test alert'
        )
        assert alert.severity == 'warning'
        assert not alert.acknowledged
        assert str(alert) == 'WARNING - Test User'


# =====================================================================
# VALIDATION / SERIALIZER TESTS
# =====================================================================

class TestNigerianPhoneRegex:
    def test_valid_phone_formats(self):
        valid = [
            '08031234567', '07031234567', '09031234567', '08131234567',
            '+2348031234567', '2348031234567',
        ]
        for phone in valid:
            assert re.match(NIGERIAN_PHONE_REGEX, phone), f'{phone} should be valid'

    def test_invalid_phone_formats(self):
        invalid = [
            '1234567890', '080123456', '02031234567',
            '080123456789', 'phone', '',
        ]
        for phone in invalid:
            assert not re.match(NIGERIAN_PHONE_REGEX, phone), f'{phone} should be invalid'


class TestConciergeLeadSerializer:
    def test_valid_data(self, db):
        data = ConciergeLeadFactory.build_attributes()
        serializer = ConciergeLeadSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_missing_ndpr_consent(self, db):
        data = ConciergeLeadFactory.build_attributes({'ndpr_consent': False})
        serializer = ConciergeLeadSerializer(data=data)
        assert not serializer.is_valid()
        assert 'ndpr_consent' in serializer.errors

    def test_invalid_phone(self, db):
        data = ConciergeLeadFactory.build_attributes({'phone': '1234567890'})
        serializer = ConciergeLeadSerializer(data=data)
        assert not serializer.is_valid()
        assert 'phone' in serializer.errors

    def test_budget_min_exceeds_max(self, db):
        data = ConciergeLeadFactory.build_attributes({'budget_min': 200_000_000, 'budget_max': 50_000_000})
        serializer = ConciergeLeadSerializer(data=data)
        assert not serializer.is_valid()
        assert 'budget_min' in serializer.errors

    def test_short_name(self, db):
        data = ConciergeLeadFactory.build_attributes({'full_name': 'A'})
        serializer = ConciergeLeadSerializer(data=data)
        assert not serializer.is_valid()
        assert 'full_name' in serializer.errors

    def test_empty_location(self, db):
        data = ConciergeLeadFactory.build_attributes({'preferred_location': 'A'})
        serializer = ConciergeLeadSerializer(data=data)
        assert not serializer.is_valid()
        assert 'preferred_location' in serializer.errors

    def test_email_normalized_to_lowercase(self, db):
        data = ConciergeLeadFactory.build_attributes({'email': 'TEST@Example.COM'})
        serializer = ConciergeLeadSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['email'] == 'test@example.com'

    def test_create_creates_consent_log(self, db):
        factory = RequestFactory()
        request = factory.post('/api/v1/crm/submit-concierge/')
        request.META['REMOTE_ADDR'] = '192.168.1.1'
        request.META['HTTP_USER_AGENT'] = 'pytest-agent'

        data = ConciergeLeadFactory.build_attributes()
        serializer = ConciergeLeadSerializer(data=data, context={'request': request})
        assert serializer.is_valid()
        lead = serializer.save()
        assert lead.consent_logs.count() == 1
        log = lead.consent_logs.first()
        assert log.ip_address == '192.168.1.1'
        assert log.user_agent == 'pytest-agent'

    def test_read_only_fields(self, db):
        lead = ConciergeLeadFactory.create()
        serializer = ConciergeLeadSerializer(lead)
        assert 'id' in serializer.data
        assert 'lead_score' in serializer.data
        assert 'sla_remaining_minutes' in serializer.data

    def test_phone_cleaned_of_spaces_and_dashes(self, db):
        data = ConciergeLeadFactory.build_attributes({'phone': ' 080-312-34567 '})
        serializer = ConciergeLeadSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['phone'] == '08031234567'

    def test_empty_email_returns_none(self, db):
        data = ConciergeLeadFactory.build_attributes({'email': ''})
        serializer = ConciergeLeadSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['email'] is None


# =====================================================================
# SERVICE TESTS
# =====================================================================

class TestLeadScoringService:
    def test_lead_scored_in_range(self, db):
        PropertyFactory.create({'property_type': 'flat', 'price': 80_000_000, 'bedrooms': 3, 'city': 'Lekki'})
        lead = ConciergeLeadFactory.create()
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert 0 <= score_obj.total_score <= 100
        assert score_obj.total_score > 0

    def test_budget_no_specific_gets_neutral(self, db):
        lead = ConciergeLeadFactory.create({'budget_min': 0, 'budget_max': 500_000_000})
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert score_obj.budget_match_score == 10

    def test_base_score_when_no_properties(self, db):
        lead = ConciergeLeadFactory.create()
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert score_obj.total_score == 30

    def test_completeness_score_full(self, db):
        lead = ConciergeLeadFactory.create()
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert score_obj.completeness_score == 15

    def test_completeness_score_minimal(self, db):
        lead = ConciergeLeadFactory.create({
            'email': None,
            'property_type': 'any',
            'bedrooms': 'any',
            'budget_min': 0,
            'budget_max': 500_000_000,
        })
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert score_obj.completeness_score >= 10
        assert score_obj.completeness_score <= 15

    def test_recalculation_updates_lead_score(self, db):
        PropertyFactory.create({'property_type': 'flat', 'price': 80_000_000, 'bedrooms': 3, 'city': 'Lekki'})
        lead = ConciergeLeadFactory.create()
        service = LeadScoringService()
        service.calculate_score(lead)
        lead.refresh_from_db()
        assert lead.lead_score > 0

    def test_urgency_score(self, db):
        lead = ConciergeLeadFactory.create()
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert 0 <= score_obj.urgency_score <= 15

    def test_score_breakdown_fields(self, db):
        PropertyFactory.create({'property_type': 'flat', 'price': 80_000_000, 'bedrooms': 3, 'city': 'Lekki'})
        lead = ConciergeLeadFactory.create()
        service = LeadScoringService()
        score_obj = service.calculate_score(lead)
        assert score_obj.budget_match_score >= 0
        assert score_obj.location_match_score >= 0
        assert score_obj.property_type_match_score >= 0
        assert score_obj.bedrooms_match_score >= 0
        assert score_obj.completeness_score >= 0
        assert score_obj.urgency_score >= 0


class TestSLAAlertService:
    def test_no_breach_for_new_lead(self, db):
        ConciergeLeadFactory.create()
        service = SLAAlertService()
        count = service.check_sla_deadlines()
        assert count == 0

    def test_breach_detected(self, db):
        lead = ConciergeLeadFactory.create()
        lead.sla_deadline = timezone.now() - timedelta(hours=3)
        lead.save(update_fields=['sla_deadline'])
        service = SLAAlertService()
        count = service.check_sla_deadlines()
        assert count == 1

    def test_no_alert_for_closed_leads(self, db):
        lead = ConciergeLeadFactory.create({'status': 'closed_won'})
        lead.sla_deadline = timezone.now() - timedelta(hours=3)
        lead.save(update_fields=['sla_deadline', 'status'])
        service = SLAAlertService()
        count = service.check_sla_deadlines()
        assert count == 0

    def test_acknowledge_alert(self, db):
        lead = ConciergeLeadFactory.create()
        alert = SLAAlert.objects.create(lead=lead, severity='warning', message='Test')
        user = User.objects.create_user(username='agent', password='pass')
        service = SLAAlertService()
        result = service.acknowledge_alert(alert.id, user)
        assert result
        alert.refresh_from_db()
        assert alert.acknowledged
        assert alert.acknowledged_by == user

    def test_acknowledge_nonexistent_alert(self, db):
        service = SLAAlertService()
        result = service.acknowledge_alert(uuid.uuid4(), None)
        assert not result

    def test_get_unacknowledged_alerts(self, db):
        lead = ConciergeLeadFactory.create()
        SLAAlert.objects.create(lead=lead, severity='warning', message='A')
        SLAAlert.objects.create(lead=lead, severity='critical', message='B')
        SLAAlert.objects.create(lead=lead, severity='warning', message='C', acknowledged=True)
        service = SLAAlertService()
        alerts = service.get_unacknowledged_alerts()
        assert len(alerts) == 2


# =====================================================================
# VIEW / API TESTS
# =====================================================================

class TestSubmitConciergeLeadView:
    URL = '/api/v1/crm/submit-concierge/'

    def test_successful_submission(self, db):
        client = APIClient()
        data = ConciergeLeadFactory.build_attributes()
        response = client.post(self.URL, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert 'id' in response.data['data']

    def test_validation_failure(self, db):
        client = APIClient()
        data = ConciergeLeadFactory.build_attributes({'phone': 'invalid'})
        response = client.post(self.URL, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['success'] is False

    def test_lead_score_calculated(self, db):
        PropertyFactory.create({'property_type': 'flat_apartment', 'price': 80_000_000, 'bedrooms': 3, 'city': 'Lekki'})
        client = APIClient()
        data = ConciergeLeadFactory.build_attributes()
        response = client.post(self.URL, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['data']['lead_score'] > 0


class TestConciergeLeadListView:
    URL = '/api/v1/crm/leads/'

    def test_requires_auth(self, db):
        client = APIClient()
        response = client.get(self.URL)
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    def test_lists_leads(self, db):
        ConciergeLeadFactory.create()
        ConciergeLeadFactory.create()
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get(self.URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_filter_by_status(self, db):
        ConciergeLeadFactory.create()
        ConciergeLeadFactory.create({'status': 'assigned'})
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get(self.URL, {'status': 'assigned'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_search_by_name(self, db):
        ConciergeLeadFactory.create({'full_name': 'John Doe'})
        ConciergeLeadFactory.create({'full_name': 'Jane Smith'})
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get(self.URL, {'search': 'John'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1


class TestConciergeLeadDetailView:
    def test_get_lead(self, db):
        lead = ConciergeLeadFactory.create()
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get(f'/api/v1/crm/leads/{lead.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['full_name'] == 'Test User'

    def test_get_not_found(self, db):
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get(f'/api/v1/crm/leads/{uuid.uuid4()}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_patch_lead(self, db):
        lead = ConciergeLeadFactory.create()
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.patch(
            f'/api/v1/crm/leads/{lead.id}/',
            {'assigned_agent': user.id},
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK

    def test_patch_rejects_disallowed_fields(self, db):
        lead = ConciergeLeadFactory.create()
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.patch(
            f'/api/v1/crm/leads/{lead.id}/',
            {'full_name': 'Hacker', 'status': 'assigned'},
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        lead.refresh_from_db()
        assert lead.full_name == 'Test User'
        assert lead.status == 'active_sla_queue'


class TestRecalculateLeadScoreView:
    def test_recalculate(self, db):
        PropertyFactory.create({'property_type': 'flat_apartment', 'price': 80_000_000, 'bedrooms': 3, 'city': 'Lekki'})
        lead = ConciergeLeadFactory.create()
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.post(f'/api/v1/crm/leads/{lead.id}/recalculate-score/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['total_score'] > 0


class TestSLAAlertViews:
    def test_list_alerts(self, db):
        lead = ConciergeLeadFactory.create()
        SLAAlert.objects.create(lead=lead, severity='warning', message='Test')
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get('/api/v1/crm/sla-alerts/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 1

    def test_acknowledge_alert(self, db):
        lead = ConciergeLeadFactory.create()
        alert = SLAAlert.objects.create(lead=lead, severity='warning', message='Test')
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.post(f'/api/v1/crm/sla-alerts/{alert.id}/acknowledge/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True


class TestConsentLogListView:
    def test_list_consent_logs(self, db):
        lead = ConciergeLeadFactory.create()
        ConsentLog.objects.create(lead=lead, ip_address='127.0.0.1')
        client = APIClient()
        user = User.objects.create_user(username='agent', password='pass')
        client.force_authenticate(user=user)
        response = client.get(f'/api/v1/crm/leads/{lead.id}/consent-logs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 1
