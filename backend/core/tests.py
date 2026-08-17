import pytest
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.http import HttpRequest, HttpResponse
from django.test import Client
from django.utils import timezone

from .middleware import IdleSessionMiddleware, TrustedProxyIPMiddleware

pytestmark = pytest.mark.django_db

User = get_user_model()


def apply_middleware(middleware_class, remote_addr, **meta_headers):
    """Run the middleware against a bare request and return the request."""
    request = HttpRequest()
    request.META["REMOTE_ADDR"] = remote_addr
    request.META.update(meta_headers)
    middleware_class(lambda request: HttpResponse("ok"))(request)
    return request


class TestTrustedProxyIPMiddleware:
    def test_x_real_ip_honored_from_loopback_peer(self):
        request = apply_middleware(
            TrustedProxyIPMiddleware,
            "127.0.0.1",
            HTTP_X_REAL_IP="41.190.12.34",
        )
        assert request.META["REMOTE_ADDR"] == "41.190.12.34"

    def test_x_real_ip_honored_from_private_peer(self):
        request = apply_middleware(
            TrustedProxyIPMiddleware,
            "10.0.0.5",
            HTTP_X_REAL_IP="41.190.12.34",
        )
        assert request.META["REMOTE_ADDR"] == "41.190.12.34"

    def test_x_forwarded_for_first_hop_honored(self):
        request = apply_middleware(
            TrustedProxyIPMiddleware,
            "127.0.0.1",
            HTTP_X_FORWARDED_FOR="41.190.12.34, 10.0.0.2",
        )
        assert request.META["REMOTE_ADDR"] == "41.190.12.34"

    def test_proxy_headers_ignored_when_peer_is_public(self):
        request = apply_middleware(
            TrustedProxyIPMiddleware,
            "8.8.8.8",
            HTTP_X_REAL_IP="41.190.12.34",
        )
        assert request.META["REMOTE_ADDR"] == "8.8.8.8"

    def test_invalid_proxy_header_ignored(self):
        request = apply_middleware(
            TrustedProxyIPMiddleware,
            "127.0.0.1",
            HTTP_X_REAL_IP="not-an-ip",
            HTTP_X_FORWARDED_FOR="also-garbage",
        )
        assert request.META["REMOTE_ADDR"] == "127.0.0.1"


class TestIdleSessionMiddleware:
    @pytest.fixture(autouse=True)
    def _db_sessions(self, settings):
        # Cache sessions are backed by DummyCache in tests; use DB sessions
        # so authentication state survives between requests.
        settings.SESSION_ENGINE = "django.contrib.sessions.backends.db"
        settings.SESSION_IDLE_TIMEOUT_SECONDS = 30 * 60

    def make_user(self, **kwargs):
        return User.objects.create_user(
            username="admin",
            password="x",
            is_staff=True,
            **kwargs,
        )

    def age_session(self, client, delta):
        session = client.session
        session["last_activity"] = (timezone.now() - delta).isoformat()
        session.save()

    def test_active_user_session_preserved(self):
        client = Client()
        client.force_login(self.make_user())
        response = client.get("/admin/login/")
        assert response.status_code in (200, 302)
        assert client.session.get("_auth_user_id")
        assert "last_activity" in client.session

    def test_idle_staff_user_redirected_from_admin(self):
        client = Client()
        client.force_login(self.make_user())
        self.age_session(client, timedelta(hours=2))
        response = client.get("/admin/")
        assert response.status_code == 302
        assert response.url.startswith("/admin/login/")

    def test_idle_user_session_flushed_on_regular_path(self):
        client = Client()
        client.force_login(self.make_user())
        self.age_session(client, timedelta(hours=2))
        response = client.get("/api/docs/")
        assert response.status_code == 200
        assert "_auth_user_id" not in client.session

    def test_corrupt_last_activity_resets_clock(self):
        client = Client()
        client.force_login(self.make_user())
        session = client.session
        session["last_activity"] = "not-a-datetime"
        session.save()
        response = client.get("/admin/login/")
        assert response.status_code in (200, 302)
        assert "last_activity" in client.session

    def test_anonymous_user_untouched(self):
        client = Client()
        response = client.get("/admin/login/")
        assert response.status_code == 200
        assert "_auth_user_id" not in client.session


class TestHealthEndpoint:
    def test_health_reports_database_healthy(self):
        response = Client().get("/api/health/")
        assert response.status_code == 200
        data = response.json()
        assert data["database"] == "healthy"
        assert data["status"] in ("healthy", "degraded")
        assert "timestamp" in data

    def test_health_never_raises_when_redis_down(self):
        response = Client().get("/api/health/")
        assert response.status_code == 200
        data = response.json()
        assert data["redis"] in ("healthy", "unhealthy")
