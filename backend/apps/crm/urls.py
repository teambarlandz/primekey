from django.urls import path
from .views import SubmitConciergeLeadView

app_name = 'crm'

urlpatterns = [
    path('submit-concierge/', SubmitConciergeLeadView.as_view(), name='submit-concierge'),
]
