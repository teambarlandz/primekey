import pytest
import uuid
import json
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.test import RequestFactory
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import ConsentLog, ExportRequest, ErasureRequest, AnonymizationLog
from core.security import hash_code, verify_code
from .serializers import (
    ConsentLogSerializer,
    ExportRequestSerializer, ExportRequestCreateSerializer, ExportRequestVerifySerializer,
    ErasureRequestSerializer, ErasureRequestCreateSerializer, ErasureRequestVerifySerializer,
    AnonymizationLogSerializer,
)
from .views import (
    ConsentLogListView,
    ExportRequestCreateView, ExportRequestVerifyView, ExportRequestStatusView,
    ErasureRequestCreateView, ErasureRequestVerifyView, ErasureRequestStatusView,
    AnonymizationLogListView,
)


# =====================================================================
# FACTORIES
# =====================================================================

class ConsentLogFactory:
    @staticmethod
    def create(overrides=None):
        data = {
            'email': 'user@example.com',
            'phone': '08031234567',
            'purpose': 'concierge_sourcing',
            'consent_given': True,
            'consent_text': 'I consent to processing.',
            'legal_basis': 'consent',
            'ip_address': '192.168.1.1',
        }
        if overrides:
            data.update(overrides)
        return ConsentLog.objects.create(**data)


class ExportRequestFactory:
    @staticmethod
    def create(overrides=None):
        data = {
            'email': 'user@example.com',
            'phone': '08031234567',
            'status': 'pending',
            'verification_code': hash_code('123456'),
            'verification_sent_at': timezone.now(),
        }
        if overrides:
            data.update(overrides)
        return ExportRequest.objects.create(**data)


class ErasureRequestFactory:
    @staticmethod
    def create(overrides=None):
        data = {
            'email': 'user@example.com',
            'phone': '08031234567',
            'status': 'pending',
            'verification_code': hash_code('654321'),
            'verification_sent_at': timezone.now(),
        }
        if overrides:
            data.update(overrides)
        return ErasureRequest.objects.create(**data)


class AnonymizationLogFactory:
    @staticmethod
    def create(overrides=None):
        data = {
            'lead_id': uuid.uuid4(),
            'lead_phone': '08031234567',
            'lead_email': 'user@example.com',
            'fields_anonymized': {'full_name': True, 'phone': True},
            'original_data_hash': hashlib.sha256(json.dumps({'test': 'data'}, sort_keys=True).encode()).hexdigest(),
            'trigger': 'retention_policy',
        }
        if overrides:
            data.update(overrides)
        return AnonymizationLog.objects.create(**data)


# =====================================================================
# MODEL TESTS
# =====================================================================

class TestConsentLogModel:
    def test_create(self, db):
        log = ConsentLogFactory.create()
        assert log.consent_given is True
        assert log.purpose == 'concierge_sourcing'
        assert isinstance(log.id, uuid.UUID)

    def test_withdrawal(self, db):
        log = ConsentLogFactory.create()
        log.withdrawn = True
        log.withdrawn_at = timezone.now()
        log.withdrawal_method = 'email'
        log.save()
        assert 'Withdrawn' in str(log)

    def test_str_with_email(self, db):
        log = ConsentLogFactory.create()
        assert 'user@example.com' in str(log)

    def test_str_with_phone(self, db):
        log = ConsentLogFactory.create({'email': None})
        assert '08031234567' in str(log)

    def test_indexes(self, db):
        ConsentLogFactory.create()
        ConsentLogFactory.create({'email': 'other@example.com', 'purpose': 'marketing_emails'})
        assert ConsentLog.objects.count() == 2


class TestExportRequestModel:
    def test_create(self, db):
        req = ExportRequestFactory.create()
        assert req.status == 'pending'
        assert verify_code(req.verification_code, '123456')
        assert isinstance(req.id, uuid.UUID)

    def test_str(self, db):
        req = ExportRequestFactory.create()
        assert 'user@example.com' in str(req)
        assert 'pending' in str(req)

    def test_default_status(self, db):
        req = ExportRequestFactory.create()
        assert req.status == 'pending'


class TestErasureRequestModel:
    def test_create(self, db):
        req = ErasureRequestFactory.create()
        assert req.status == 'pending'
        assert verify_code(req.verification_code, '654321')

    def test_str(self, db):
        req = ErasureRequestFactory.create()
        assert 'user@example.com' in str(req)


class TestAnonymizationLogModel:
    def test_create(self, db):
        log = AnonymizationLogFactory.create()
        assert log.trigger == 'retention_policy'
        assert log.fields_anonymized == {'full_name': True, 'phone': True}

    def test_verify_original_data(self, db):
        lead_id = uuid.uuid4()
        original = {'full_name': 'Test User', 'phone': '08031234567'}
        AnonymizationLogFactory.create({
            'lead_id': lead_id,
            'original_data_hash': hashlib.sha256(
                json.dumps(original, sort_keys=True).encode()
            ).hexdigest(),
        })
        assert AnonymizationLog.verify_original_data(lead_id, original)
        assert not AnonymizationLog.verify_original_data(lead_id, {'fake': 'data'})
        assert not AnonymizationLog.verify_original_data(uuid.uuid4(), original)

    def test_str(self, db):
        log = AnonymizationLogFactory.create()
        assert '08031234567' in str(log)


# =====================================================================
# SERIALIZER TESTS
# =====================================================================

class TestExportRequestCreateSerializer:
    def test_valid_with_email(self, db):
        serializer = ExportRequestCreateSerializer(data={'email': 'user@example.com'})
        assert serializer.is_valid(), serializer.errors

    def test_valid_with_phone(self, db):
        serializer = ExportRequestCreateSerializer(data={'phone': '08031234567'})
        assert serializer.is_valid(), serializer.errors

    def test_invalid_no_identifier(self, db):
        serializer = ExportRequestCreateSerializer(data={})
        assert not serializer.is_valid()

    def test_create_generates_code(self, db):
        serializer = ExportRequestCreateSerializer(data={'email': 'user@example.com'})
        assert serializer.is_valid()
        req = serializer.save()
        assert req.verification_code is not None
        assert ":" in req.verification_code
        assert req.verification_sent_at is not None


class TestExportRequestVerifySerializer:
    def test_valid_code(self, db):
        req = ExportRequestFactory.create()
        serializer = ExportRequestVerifySerializer(data={
            'email': 'user@example.com',
            'code': '123456',
        })
        assert serializer.is_valid(), serializer.errors

    def test_invalid_code(self, db):
        ExportRequestFactory.create()
        serializer = ExportRequestVerifySerializer(data={
            'email': 'user@example.com',
            'code': '000000',
        })
        assert not serializer.is_valid()

    def test_exceeded_attempts(self, db):
        req = ExportRequestFactory.create({'verification_attempts': 5})
        serializer = ExportRequestVerifySerializer(data={
            'email': 'user@example.com',
            'code': '123456',
        })
        assert not serializer.is_valid()
        assert 'attempts' in str(serializer.errors).lower()

    def test_expired_code(self, db):
        req = ExportRequestFactory.create({
            'verification_sent_at': timezone.now() - timedelta(minutes=16),
        })
        serializer = ExportRequestVerifySerializer(data={
            'email': 'user@example.com',
            'code': '123456',
        })
        assert not serializer.is_valid()
        assert 'expired' in str(serializer.errors).lower()


class TestErasureRequestCreateSerializer:
    def test_valid(self, db):
        serializer = ErasureRequestCreateSerializer(data={'email': 'user@example.com'})
        assert serializer.is_valid(), serializer.errors

    def test_invalid_no_identifier(self, db):
        serializer = ErasureRequestCreateSerializer(data={})
        assert not serializer.is_valid()

    def test_create_generates_code(self, db):
        serializer = ErasureRequestCreateSerializer(data={'email': 'user@example.com'})
        assert serializer.is_valid()
        req = serializer.save()
        assert req.verification_code is not None
        assert ":" in req.verification_code


class TestErasureRequestVerifySerializer:
    def test_valid_code(self, db):
        req = ErasureRequestFactory.create()
        serializer = ErasureRequestVerifySerializer(data={
            'email': 'user@example.com',
            'code': '654321',
        })
        assert serializer.is_valid(), serializer.errors

    def test_invalid_code(self, db):
        ErasureRequestFactory.create()
        serializer = ErasureRequestVerifySerializer(data={
            'email': 'user@example.com',
            'code': '000000',
        })
        assert not serializer.is_valid()


class TestConsentLogSerializer:
    def test_serialize(self, db):
        log = ConsentLogFactory.create()
        serializer = ConsentLogSerializer(log)
        assert serializer.data['email'] == 'user@example.com'
        assert serializer.data['purpose'] == 'concierge_sourcing'
        assert serializer.data['consent_given'] is True


class TestAnonymizationLogSerializer:
    def test_serialize(self, db):
        log = AnonymizationLogFactory.create()
        serializer = AnonymizationLogSerializer(log)
        assert serializer.data['trigger'] == 'retention_policy'
        assert serializer.data['fields_anonymized'] == {'full_name': True, 'phone': True}


# =====================================================================
# VIEW / API TESTS
# =====================================================================

class TestExportRequestCreateView:
    URL = '/api/v1/compliance/export/'

    def test_successful_creation(self, db):
        client = APIClient()
        response = client.post(self.URL, {'email': 'user@example.com'}, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True

    def test_missing_identifier(self, db):
        client = APIClient()
        response = client.post(self.URL, {}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['success'] is False

    def test_returns_export_data(self, db):
        client = APIClient()
        response = client.post(self.URL, {'email': 'user@example.com'}, format='json')
        assert 'data' in response.data
        assert response.data['data']['status'] == 'pending'


from unittest.mock import patch


class TestExportRequestVerifyView:
    URL = '/api/v1/compliance/export/verify/'

    @patch('django_q.tasks.async_task')
    def test_successful_verification(self, mock_async_task, db):
        req = ExportRequestFactory.create()
        client = APIClient()
        response = client.post(self.URL, {'email': 'user@example.com', 'code': '123456'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        req.refresh_from_db()
        assert req.verified_at is not None
        assert req.status == 'processing'

    def test_failed_verification(self, db):
        ExportRequestFactory.create()
        client = APIClient()
        response = client.post(self.URL, {'email': 'user@example.com', 'code': '000000'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['success'] is False


class TestExportRequestStatusView:
    def _owner_client(self):
        client = APIClient()
        user = User.objects.create_user(username='08031234567', password='pass')
        client.force_authenticate(user=user)
        return client

    def test_get_status(self, db):
        req = ExportRequestFactory.create()
        response = self._owner_client().get(f'/api/v1/compliance/export/{req.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'pending'

    def test_not_found(self, db):
        response = self._owner_client().get(f'/api/v1/compliance/export/{uuid.uuid4()}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_forbidden_for_other_user(self, db):
        req = ExportRequestFactory.create()
        client = APIClient()
        other = User.objects.create_user(username='otheruser', password='pass')
        client.force_authenticate(user=other)
        response = client.get(f'/api/v1/compliance/export/{req.id}/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_requires_auth(self, db):
        req = ExportRequestFactory.create()
        response = APIClient().get(f'/api/v1/compliance/export/{req.id}/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestErasureRequestCreateView:
    URL = '/api/v1/compliance/erase/'

    def test_successful_creation(self, db):
        client = APIClient()
        response = client.post(self.URL, {'email': 'user@example.com'}, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True

    def test_missing_identifier(self, db):
        client = APIClient()
        response = client.post(self.URL, {}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestErasureRequestVerifyView:
    URL = '/api/v1/compliance/erase/verify/'

    @patch('django_q.tasks.async_task')
    def test_successful_verification(self, mock_async_task, db):
        req = ErasureRequestFactory.create()
        client = APIClient()
        response = client.post(self.URL, {'email': 'user@example.com', 'code': '654321'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        req.refresh_from_db()
        assert req.verified_at is not None
        assert req.status == 'processing'


class TestErasureRequestStatusView:
    def _owner_client(self):
        client = APIClient()
        user = User.objects.create_user(username='08031234567', password='pass')
        client.force_authenticate(user=user)
        return client

    def test_get_status(self, db):
        req = ErasureRequestFactory.create()
        response = self._owner_client().get(f'/api/v1/compliance/erase/{req.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'pending'

    def test_forbidden_for_other_user(self, db):
        req = ErasureRequestFactory.create()
        client = APIClient()
        other = User.objects.create_user(username='otheruser', password='pass')
        client.force_authenticate(user=other)
        response = client.get(f'/api/v1/compliance/erase/{req.id}/')
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestConsentLogListView:
    URL = '/api/v1/compliance/consent-logs/'

    def test_requires_auth(self, db):
        client = APIClient()
        response = client.get(self.URL)
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    def test_lists_logs(self, db):
        ConsentLogFactory.create()
        ConsentLogFactory.create({'email': 'other@example.com', 'purpose': 'marketing_emails'})
        client = APIClient()
        user = User.objects.create_user(username='admin', password='pass', is_staff=True)
        client.force_authenticate(user=user)
        response = client.get(self.URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_filter_by_purpose(self, db):
        ConsentLogFactory.create()
        ConsentLogFactory.create({'email': 'other@example.com', 'purpose': 'marketing_emails'})
        client = APIClient()
        user = User.objects.create_user(username='admin', password='pass', is_staff=True)
        client.force_authenticate(user=user)
        response = client.get(self.URL, {'purpose': 'marketing_emails'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1


class TestAnonymizationLogListView:
    URL = '/api/v1/compliance/anonymization-logs/'

    def test_requires_auth(self, db):
        client = APIClient()
        response = client.get(self.URL)
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    def test_lists_logs(self, db):
        AnonymizationLogFactory.create()
        client = APIClient()
        user = User.objects.create_user(username='admin', password='pass', is_staff=True)
        client.force_authenticate(user=user)
        response = client.get(self.URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
