from django_ratelimit.exceptions import Ratelimited
from rest_framework import status
from rest_framework.views import exception_handler as drf_exception_handler

from .response import error_response


def custom_exception_handler(exc, context):
    """Map django-ratelimit's Ratelimited into a JSON 429 for DRF views."""
    if isinstance(exc, Ratelimited):
        return error_response(
            message="Too many requests. Please try again later.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    response = drf_exception_handler(exc, context)
    if response is not None:
        # Wrap DRF's default error responses in our envelope
        message = "Validation failed."
        errors = response.data

        # Extract a human-readable message from common DRF error formats
        if isinstance(response.data, dict):
            if "detail" in response.data:
                message = response.data.pop("detail")
                errors = response.data if response.data else None
        elif isinstance(response.data, list):
            message = str(response.data)

        return error_response(message=str(message), errors=errors, status_code=response.status_code)

    return error_response(
        message="Internal server error.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
