import logging

from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

logger = logging.getLogger(__name__)


def health_check(request):
    """
    GET /health/

    Returns 200 if the app, database, and Redis are all reachable.
    Returns 503 if any dependency is down.
    """
    checks = {"app": "ok"}
    status_code = 200

    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["db"] = "ok"
    except Exception:
        logger.exception("Health check: database unreachable")
        checks["db"] = "error"
        status_code = 503

    # Redis check
    try:
        cache.set("_health_check", "ok", 5)
        if cache.get("_health_check") == "ok":
            checks["redis"] = "ok"
        else:
            checks["redis"] = "error"
            status_code = 503
    except Exception:
        logger.exception("Health check: redis unreachable")
        checks["redis"] = "error"
        status_code = 503

    return JsonResponse({"status": "ok" if status_code == 200 else "error", **checks}, status=status_code)
