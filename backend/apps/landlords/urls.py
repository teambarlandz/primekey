from django.urls import path
from .views import (
    LandlordRegistrationView,
    LandlordProfileDetailView,
    PropertyIntakeCreateView,
    PropertyIntakeListView,
    AppointmentCreateView,
    AppointmentListView,
    AppointmentUpdateView,
)

app_name = 'landlords'

urlpatterns = [
    path('register/', LandlordRegistrationView.as_view(), name='register'),
    path('profiles/<uuid:pk>/', LandlordProfileDetailView.as_view(), name='profile-detail'),
    path('intakes/', PropertyIntakeCreateView.as_view(), name='intake-create'),
    path('landlords/<uuid:landlord_pk>/intakes/', PropertyIntakeListView.as_view(), name='intake-list'),
    path('appointments/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('landlords/<uuid:landlord_pk>/appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path('appointments/<uuid:pk>/', AppointmentUpdateView.as_view(), name='appointment-update'),
]
