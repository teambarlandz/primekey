from django.urls import path
from .views import SubmitConciergeLeadView

urlpatterns = [
    path(
        "submit-concierge", SubmitConciergeLeadView.as_view(), name="submit-concierge"
    ),
]
