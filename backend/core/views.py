"""
Operational endpoints: uptime health checks (deployment-ops.md contract).
"""

from datetime import datetime, timezone

from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError
from django.http import JsonResponse
from django_ratelimit.decorators import ratelimit


def _database_healthy() -> bool:
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True
    except OperationalError:
        return False


def _redis_healthy() -> bool:
    try:
        import redis

        client = redis.from_url(settings.REDIS_URL, socket_timeout=2)
        return bool(client.ping())
    except Exception:
        return False


@ratelimit(key='ip', rate='30/m', method='GET')
def health_check(request):
    """
    GET /api/health — AllowAny, rate-limited (30/m). No PII, intentionally
    public for uptime monitors; real auth is on API data endpoints.
    """
    db_ok = _database_healthy()
    redis_ok = _redis_healthy()

    return JsonResponse(
        {
            "status": "healthy" if db_ok and redis_ok else "degraded",
            "database": "healthy" if db_ok else "unhealthy",
            "redis": "healthy" if redis_ok else "unhealthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )