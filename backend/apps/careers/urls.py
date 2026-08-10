from django.urls import path

from .views import JobOpeningListView

app_name = "careers"

urlpatterns = [
    path("openings/", JobOpeningListView.as_view(), name="job-openings"),
]
