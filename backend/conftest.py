import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django
from django.conf import settings

# Disable rate limiting during tests by using dummy cache
settings.CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    },
    "sessions": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    },
}

# Also override RATELIMIT_USE_CACHE
settings.RATELIMIT_USE_CACHE = "default"

# Configure Django Q for testing (sync mode)
settings.Q_CLUSTER = {
    **settings.Q_CLUSTER,
    "sync": True,
}

django.setup()

import pytest
from django.test import Client
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def valid_landlord_payload():
    return {
        "full_name": "Test Landlord",
        "phone": "08012345678",
        "email": "landlord@test.com",
        "id_type": "nin",
        "id_number": "12345678901",
        "property_count": 1,
        "ndpr_consent": True,
    }