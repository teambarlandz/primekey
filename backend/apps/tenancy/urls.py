from django.urls import path
from .views import (
    UnitListView, UnitDetailView,
    TenantListView, TenantDetailView,
    LeaseListView, LeaseDetailView,
    LandlordTenancyDashboardView,
    DashboardTenancySummaryView,
)

app_name = 'tenancy'

urlpatterns = [
    path('units/', UnitListView.as_view(), name='unit-list'),
    path('units/<uuid:pk>/', UnitDetailView.as_view(), name='unit-detail'),
    path('tenants/', TenantListView.as_view(), name='tenant-list'),
    path('tenants/<uuid:pk>/', TenantDetailView.as_view(), name='tenant-detail'),
    path('leases/', LeaseListView.as_view(), name='lease-list'),
    path('leases/<uuid:pk>/', LeaseDetailView.as_view(), name='lease-detail'),
    path('landlord/dashboard/', LandlordTenancyDashboardView.as_view(), name='landlord-dashboard'),
    path('dashboard/tenancy-summary/', DashboardTenancySummaryView.as_view(), name='tenancy-summary'),
]