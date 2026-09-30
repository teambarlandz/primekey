"""
URL configuration for core project.

Versioned API endpoints under /api/v1/
OpenAPI schema at /api/schema/
Swagger UI at /api/docs/
"""

from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from core.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),

    # Uptime monitoring endpoint (deployment-ops.md) — AllowAny + ratelimited in view
    path('api/health/', health_check, name='health'),

    # API v1 endpoints
    path('api/v1/crm/', include('apps.crm.urls', namespace='crm')),
    path('api/v1/careers/', include('apps.careers.urls', namespace='careers')),
    path('api/v1/properties/', include('apps.properties.urls', namespace='properties')),
    path('api/v1/landlords/', include('apps.landlords.urls', namespace='landlords')),
    path('api/v1/tenancy/', include('apps.tenancy.urls', namespace='tenancy')),
    path('api/v1/compliance/', include('apps.compliance.urls', namespace='compliance')),
    # Phase 3 gated — no endpoints yet; keep include so future builder marketplace can mount without URL churn
    path('api/v1/ecommerce/', include('apps.ecommerce.urls', namespace='ecommerce')),
    path('api/v1/auth/otp/', include('apps.otp_auth.urls', namespace='otp_auth')),
    path('api/v1/dashboard/', include('apps.dashboard.urls', namespace='dashboard')),
    path('api/v1/notifications/', include('apps.notifications.urls', namespace='notifications')),
    path('api/v1/messaging/', include('apps.messaging.urls', namespace='messaging')),
    path('api/v1/users/', include('apps.users.urls', namespace='users')),
    path('api/v1/contact/', include('apps.contact.urls', namespace='contact')),

    # OpenAPI Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# MEDIA_ROOT is served explicitly (django.conf.urls.static.static() is a no-op
# when DEBUG=False, which 404s every uploaded resume). Set SERVE_MEDIA=False if
# media is moved to S3/object storage or fronted by a CDN.
if settings.SERVE_MEDIA:
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": str(settings.MEDIA_ROOT)},
        ),
    ]
