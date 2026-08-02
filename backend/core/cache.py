"""Development cache backend that subclasses LocMemCache.

django-ratelimit 4.1 hard-fails on the stock LocMemCache backend during system
checks. Subclassing keeps the same in-memory behavior while passing the checks
(falls back to the W001 "not officially supported" warning).

Production should switch to `django_redis.cache.RedisCache`.
"""

from django.core.cache.backends.locmem import LocMemCache


class DevLocMemCache(LocMemCache):
    pass
