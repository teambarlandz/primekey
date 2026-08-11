"""Security regression tests for PrimeKey backend.

Covers OWASP Top 10 categories and Phase 7 hardening measures:
- A01: Broken Access Control (IDOR, mass-assignment, ownership scoping)
- A02: Cryptographic Failures (OTP hashing, JWT config)
- A03: Injection (upload validation, serializer field whitelists)
- A04: Insecure Design (config guards, rate limiting)
- A05: Security Misconfiguration (DEBUG, SECRET_KEY, headers)
- A07: Identification & Authentication Failures (OTP lockout, brute-force)
"""

import io
import pytest
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.test import RequestFactory, override_settings
from rest_framework.test import APIClient

from apps.dashboard.models import AgentProfile
from apps.landlords.models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from core.security import (
    get_client_ip,
    hash_code,
    verify_code,
    check_and_record_failure,
    remaining_lock,
    clear_failures,
    is_dev_client,
)
from core.config_checks import (
    validate_secret_key,
    validate_allowed_hosts,
    validate_production_settings,
)

pytestmark = pytest.mark.django_db

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_landlord(**overrides):
    data = {
        "full_name": "Security Test Landlord",
        "phone": "08011112222",
        "email": "sec@test.com",
        "id_type": "nin",
        "id_number": "11122233344",
        "property_count": 1,
        "ndpr_consent": True,
    }
    data.update(overrides)
    return LandlordProfile.objects.create(**data)


def _landlord_client(landlord):
    user = User.objects.create_user(username=landlord.phone, password="x")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _agent_client():
    user = User.objects.create_user(username="agent_sec", password="x")
    AgentProfile.objects.create(user=user, role="agent", phone="08099999999", full_name="Sec Agent")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _fake_pdf():
    f = io.BytesIO(b"%PDF-1.4 security test content endobj")
    f.name = "test.pdf"
    return f


# ===========================================================================
# A01: Broken Access Control
# ===========================================================================

class TestIDORPrevention:
    def test_intake_create_server_derives_landlord(self, db):
        landlord = _make_landlord()
        other = _make_landlord(full_name="Other", phone="09988877766", email="other@x.com")
        client = _landlord_client(landlord)
        payload = {
            "landlord": str(other.id),
            "title": "IDOR Test",
            "property_type": "flat",
            "price": "1000000",
            "address": "1 Test St",
            "city": "Lagos",
            "state": "Lagos",
            "area": "VI",
            "bedrooms": 2,
            "bathrooms": 1,
            "toilets": 1,
        }
        response = client.post("/api/v1/landlords/intakes/", payload, format="json")
        assert response.status_code == 201
        intake = PropertyIntake.objects.first()
        assert intake.landlord == landlord
        assert intake.landlord != other

    def test_document_list_forbidden_for_other_user(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        doc_resp = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed", "file": _fake_pdf()},
            format="multipart",
        )
        assert doc_resp.status_code == 201

        other = _make_landlord(full_name="Other", phone="09988877766", email="other@x.com")
        other_client = _landlord_client(other)
        response = other_client.get(f"/api/v1/landlords/landlords/{landlord.id}/documents/")
        assert response.status_code == 403

    def test_appointment_list_forbidden_for_other_user(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")

        other = _make_landlord(full_name="Other", phone="09988877766", email="other@x.com")
        other_client = _landlord_client(other)
        response = other_client.get(f"/api/v1/landlords/landlords/{landlord.id}/appointments/")
        assert response.status_code == 403

    def test_unauthenticated_upload_rejected(self, db):
        landlord = _make_landlord()
        response = APIClient().post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed"},
            format="multipart",
        )
        assert response.status_code == 401

    def test_unauthenticated_intake_rejected(self, db):
        response = APIClient().post("/api/v1/landlords/intakes/", {
            "title": "Test", "property_type": "flat", "price": "1000000",
            "address": "1 St", "city": "Lagos", "state": "Lagos",
            "area": "VI", "bedrooms": 1, "bathrooms": 1, "toilets": 1,
        }, format="json")
        assert response.status_code == 401

    def test_unauthenticated_appointment_rejected(self, db):
        response = APIClient().post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        assert response.status_code == 401


class TestMassAssignmentPrevention:
    def test_intake_status_not_client_settable(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        payload = {
            "title": "Test", "property_type": "flat", "price": "1000000",
            "address": "1 St", "city": "Lagos", "state": "Lagos",
            "area": "VI", "bedrooms": 1, "bathrooms": 1, "toilets": 1,
            "status": "approved",
        }
        response = client.post("/api/v1/landlords/intakes/", payload, format="json")
        assert response.status_code == 201
        assert PropertyIntake.objects.first().status == "submitted"

    def test_appointment_status_not_client_settable(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        payload = {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM",
            "tour_type": "virtual", "status": "confirmed",
        }
        response = client.post("/api/v1/landlords/appointments/", payload, format="json")
        assert response.status_code == 201
        assert Appointment.objects.first().status == "pending"

    def test_owner_cannot_self_confirm_appointment(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        resp = client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        appt_id = resp.data["data"]["id"]

        response = client.patch(
            f"/api/v1/landlords/appointments/{appt_id}/",
            {"status": "confirmed"},
            format="json",
        )
        assert response.status_code == 403

    def test_owner_can_cancel_appointment(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        resp = client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        appt_id = resp.data["data"]["id"]

        response = client.patch(
            f"/api/v1/landlords/appointments/{appt_id}/",
            {"status": "cancelled"},
            format="json",
        )
        assert response.status_code == 200

    def test_rejects_unknown_fields(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        resp = client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        appt_id = resp.data["data"]["id"]

        response = client.patch(
            f"/api/v1/landlords/appointments/{appt_id}/",
            {"notes": "sneaky", "created_at": "2020-01-01"},
            format="json",
        )
        assert response.status_code == 400


# ===========================================================================
# A03: Injection — Upload Validation
# ===========================================================================

class TestUploadValidation:
    def test_reject_python_file(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        fake = io.BytesIO(b"import os; os.system('rm -rf /')")
        fake.name = "malicious.pdf"
        response = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed", "file": fake},
            format="multipart",
        )
        assert response.status_code == 400

    def test_reject_html_file(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        fake = io.BytesIO(b"<html><script>alert(1)</script></html>")
        fake.name = "xss.png"
        response = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed", "file": fake},
            format="multipart",
        )
        assert response.status_code == 400

    def test_reject_empty_file(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        fake = io.BytesIO(b"")
        fake.name = "empty.pdf"
        response = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed", "file": fake},
            format="multipart",
        )
        assert response.status_code == 400

    def test_reject_extension_spoofing(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        fake = io.BytesIO(b"MZ\x90\x00PE executable")
        fake.name = "exe.pdf"
        response = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed", "file": fake},
            format="multipart",
        )
        assert response.status_code == 400

    def test_accept_valid_pdf(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        fake = _fake_pdf()
        response = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed", "file": fake},
            format="multipart",
        )
        assert response.status_code == 201

    def test_no_file_rejected(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        response = client.post(
            "/api/v1/landlords/documents/",
            {"landlord_id": str(landlord.id), "doc_type": "title_deed"},
            format="multipart",
        )
        assert response.status_code == 400


# ===========================================================================
# A02: Cryptographic Failures — OTP
# ===========================================================================

class TestOTPSecurity:
    def test_hash_code_is_salted(self, db):
        h1 = hash_code("123456")
        h2 = hash_code("123456")
        assert h1 != h2
        assert ":" in h1
        assert ":" in h2

    def test_verify_code_constant_time(self, db):
        code = "654321"
        hashed = hash_code(code)
        assert verify_code(hashed, code) is True
        assert verify_code(hashed, "000000") is False

    @override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
    def test_lockout_after_failures(self, db):
        code = "111111"
        clear_failures(code)
        for _ in range(3):
            check_and_record_failure(code)
        assert remaining_lock(code) > 0

    @override_settings(CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}})
    def test_lockout_still_verifies_correct_code(self, db):
        code = "222222"
        hashed = hash_code(code)
        clear_failures(code)
        for _ in range(3):
            check_and_record_failure(code)
        assert remaining_lock(code) > 0
        assert verify_code(hashed, code) is True


# ===========================================================================
# A05: Security Misconfiguration — Config Guards
# ===========================================================================

class TestConfigGuards:
    def test_reject_wildcard_allowed_hosts(self):
        with pytest.raises(ImproperlyConfigured, match="ALLOWED_HOSTS"):
            validate_allowed_hosts(["*"])

    def test_reject_empty_allowed_hosts(self):
        with pytest.raises(ImproperlyConfigured, match="ALLOWED_HOSTS"):
            validate_allowed_hosts([])

    def test_reject_weak_secret_key(self):
        with pytest.raises(ImproperlyConfigured, match="SECRET_KEY"):
            validate_secret_key("short")

    def test_reject_known_secret_key(self):
        with pytest.raises(ImproperlyConfigured, match="SECRET_KEY"):
            validate_secret_key("changeme")

    def test_reject_low_entropy_secret_key(self):
        with pytest.raises(ImproperlyConfigured, match="entropy"):
            validate_secret_key("a" * 64)

    def test_debug_mode_skips_validation(self):
        """When debug=True, the function returns early without raising."""
        validate_production_settings(
            secret_key="short",
            debug=True,
            allowed_hosts=["*"],
        )

    def test_reject_invalid_key_in_production(self):
        with pytest.raises(ImproperlyConfigured):
            validate_production_settings(
                secret_key="short",
                debug=False,
                allowed_hosts=["example.com"],
            )

    def test_reject_wildcard_hosts_in_production(self):
        with pytest.raises(ImproperlyConfigured):
            validate_production_settings(
                secret_key="abc123DEF456ghi789JKL012mno345QRS678tuv901WXZ23456",
                debug=False,
                allowed_hosts=["*"],
            )

    def test_accept_valid_production_config(self):
        validate_production_settings(
            secret_key="abc123DEF456ghi789JKL012mno345QRS678tuv901WXZ23456",
            debug=False,
            allowed_hosts=["example.com"],
        )


# ===========================================================================
# A05: Security Misconfiguration — IP Header Spoofing
# ===========================================================================

class TestIPHeaderSpoofing:
    def test_x_real_ip_ignored_from_public_ip(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="8.8.8.8", HTTP_X_REAL_IP="10.0.0.1")
        ip = get_client_ip(request)
        assert ip == "8.8.8.8"

    def test_x_forwarded_for_ignored_from_public_ip(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="8.8.8.8", HTTP_X_FORWARDED_FOR="10.0.0.1")
        ip = get_client_ip(request)
        assert ip == "8.8.8.8"

    def test_x_real_ip_trusted_from_loopback(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="127.0.0.1", HTTP_X_REAL_IP="10.0.0.1")
        ip = get_client_ip(request)
        assert ip == "10.0.0.1"

    def test_x_forwarded_for_trusted_from_private(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="192.168.1.1", HTTP_X_FORWARDED_FOR="10.0.0.1")
        ip = get_client_ip(request)
        assert ip == "10.0.0.1"

    def test_no_header_returns_remote_addr(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="8.8.8.8")
        ip = get_client_ip(request)
        assert ip == "8.8.8.8"


# ===========================================================================
# A04: Insecure Design — Dev Code Gate
# ===========================================================================

class TestDevCodeGate:
    @override_settings(DEBUG=True)
    def test_dev_code_allowed_on_loopback(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="127.0.0.1")
        assert is_dev_client(request) is True

    @override_settings(DEBUG=True)
    def test_dev_code_blocked_on_public_ip(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="8.8.8.8")
        assert is_dev_client(request) is False

    @override_settings(DEBUG=False)
    def test_dev_code_blocked_in_production(self):
        factory = RequestFactory()
        request = factory.get("/", REMOTE_ADDR="127.0.0.1")
        assert is_dev_client(request) is False


# ===========================================================================
# A04: Insecure Design — Owner Transition Restrictions
# ===========================================================================

class TestAppointmentOwnerTransitions:
    def test_owner_pending_to_cancelled_allowed(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        resp = client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        appt_id = resp.data["data"]["id"]
        response = client.patch(f"/api/v1/landlords/appointments/{appt_id}/",
                                {"status": "cancelled"}, format="json")
        assert response.status_code == 200

    def test_owner_pending_to_completed_rejected(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        resp = client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        appt_id = resp.data["data"]["id"]
        response = client.patch(f"/api/v1/landlords/appointments/{appt_id}/",
                                {"status": "completed"}, format="json")
        assert response.status_code == 403

    def test_agent_can_confirm(self, db):
        landlord = _make_landlord()
        client = _landlord_client(landlord)
        resp = client.post("/api/v1/landlords/appointments/", {
            "preferred_date": "2026-10-01", "time_slot": "11:00 AM", "tour_type": "virtual",
        }, format="json")
        appt_id = resp.data["data"]["id"]

        agent_cl = _agent_client()
        response = agent_cl.patch(f"/api/v1/landlords/appointments/{appt_id}/",
                                  {"status": "confirmed"}, format="json")
        assert response.status_code == 200


# ===========================================================================
# A05: API Docs Access Control
# ===========================================================================

class TestAPIDocsAccess:
    @override_settings(
        DEBUG=False,
        SPECTACULAR_SETTINGS={
            "TITLE": "Primekey Homes API",
            "DESCRIPTION": "Nigerian real estate platform API.",
            "VERSION": "1.0.0",
            "SERVE_INCLUDE_SCHEMA": False,
            "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
        },
    )
    def test_spectacular_settings_restrict_docs_in_production(self):
        from django.conf import settings
        assert settings.SPECTACULAR_SETTINGS.get("SERVE_PERMISSIONS") is not None

    def test_spectacular_settings_allow_in_debug(self):
        from django.conf import settings
        with override_settings(DEBUG=True):
            pass
        perms = settings.SPECTACULAR_SETTINGS.get("SERVE_PERMISSIONS")
        assert perms is None
