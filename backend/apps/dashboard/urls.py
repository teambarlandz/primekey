from django.urls import path
from .views import (
    DashboardSummaryView,
    DashboardLandlordListView,
    DashboardLeadListView,
    DashboardIntakeListView,
    DashboardAppointmentListView,
    DashboardDocumentListView,
    DocumentReviewView,
    LandlordVerificationUpdateView,
    IntakeStatusUpdateView,
    AppointmentUpdateView,
)

app_name = 'dashboard'

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='summary'),
    path('landlords/', DashboardLandlordListView.as_view(), name='landlords'),
    path('leads/', DashboardLeadListView.as_view(), name='leads'),
    path('intakes/', DashboardIntakeListView.as_view(), name='intakes'),
    path('appointments/', DashboardAppointmentListView.as_view(), name='appointments'),
    path('documents/', DashboardDocumentListView.as_view(), name='documents'),
    path('documents/<uuid:pk>/', DocumentReviewView.as_view(), name='document-review'),
    path('landlords/<uuid:pk>/verification/', LandlordVerificationUpdateView.as_view(), name='landlord-verification'),
    path('intakes/<uuid:pk>/', IntakeStatusUpdateView.as_view(), name='intake-status'),
    path('appointments/<uuid:pk>/', AppointmentUpdateView.as_view(), name='appointment-update'),
]
