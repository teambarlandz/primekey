from django.urls import path
from .views import (
    DashboardSummaryView,
    DashboardLandlordListView,
    DashboardIntakeListView,
    DashboardAppointmentListView,
    LandlordVerificationUpdateView,
    IntakeStatusUpdateView,
    AppointmentUpdateView,
)

app_name = 'dashboard'

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='summary'),
    path('landlords/', DashboardLandlordListView.as_view(), name='landlords'),
    path('intakes/', DashboardIntakeListView.as_view(), name='intakes'),
    path('appointments/', DashboardAppointmentListView.as_view(), name='appointments'),
    path('landlords/<uuid:pk>/verification/', LandlordVerificationUpdateView.as_view(), name='landlord-verification'),
    path('intakes/<uuid:pk>/', IntakeStatusUpdateView.as_view(), name='intake-status'),
    path('appointments/<uuid:pk>/', AppointmentUpdateView.as_view(), name='appointment-update'),
]
