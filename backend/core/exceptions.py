from django_ratelimit.exceptions import Ratelimited
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    """Map django-ratelimit's Ratelimited into a JSON 429 for DRF views."""
    if isinstance(exc, Ratelimited):
        return Response(
            {
                "success": False,
                "message": "Too many requests. Please try again later.",
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    return drf_exception_handler(exc, context)
