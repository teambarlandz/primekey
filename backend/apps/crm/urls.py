from django.urls import path
from .views import SubmitConciergeLeadView, NDPRErasureView

app_name = 'crm'

urlpatterns = [
    path('submit-concierge/', SubmitConciergeLeadView.as_view(), name='submit-concierge'),
    path('ndpr/request-erasure/', NDPRErasureView.as_view(), name='ndpr-erasure'),
]
