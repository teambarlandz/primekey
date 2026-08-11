from django.urls import path

from .views import (
    JobApplicationCreateView,
    JobApplicationListView,
    JobOpeningDetailView,
    JobOpeningListView,
)

app_name = "careers"

urlpatterns = [
    path("openings/", JobOpeningListView.as_view(), name="job-openings"),
    path("openings/<uuid:pk>/", JobOpeningDetailView.as_view(), name="job-opening-detail"),
    path("applications/", JobApplicationCreateView.as_view(), name="job-application-create"),
    path(
        "openings/<uuid:opening_pk>/applications/",
        JobApplicationListView.as_view(),
        name="job-application-list",
    ),
]
