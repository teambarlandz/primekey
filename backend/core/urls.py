"""
URL configuration for core project.

Versioned API endpoints under /api/v1/
OpenAPI schema at /api/schema/
Swagger UI at /api/docs/
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Legacy/unversioned route used by frontend lib/api-client.ts
    path('api/crm/', include('apps.crm.urls', namespace='crm_legacy')),

    # API v1 endpoints
    path('api/v1/crm/', include('apps.crm.urls', namespace='crm')),
    path('api/v1/careers/', include('apps.careers.urls', namespace='careers')),
    path('api/v1/properties/', include('apps.properties.urls', namespace='properties')),
    path('api/v1/landlords/', include('apps.landlords.urls', namespace='landlords')),
    path('api/v1/compliance/', include('apps.compliance.urls', namespace='compliance')),
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
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
