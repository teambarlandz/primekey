from django.urls import path
from .views import (
    SubmitConciergeLeadView,
    ConciergeLeadListView,
    ConciergeLeadDetailView,
    RecalculateLeadScoreView,
    SLAAlertListView,
    SLAAlertAcknowledgeView,
    ConsentLogListView,
)

app_name = 'crm'

urlpatterns = [
    path('submit-concierge/', SubmitConciergeLeadView.as_view(), name='submit-concierge'),
    path('leads/', ConciergeLeadListView.as_view(), name='lead-list'),
    path('leads/<uuid:pk>/', ConciergeLeadDetailView.as_view(), name='lead-detail'),
    path('leads/<uuid:pk>/recalculate-score/', RecalculateLeadScoreView.as_view(), name='lead-recalculate-score'),
    path('leads/<uuid:lead_pk>/consent-logs/', ConsentLogListView.as_view(), name='lead-consent-logs'),
    path('sla-alerts/', SLAAlertListView.as_view(), name='sla-alert-list'),
    path('sla-alerts/<uuid:pk>/acknowledge/', SLAAlertAcknowledgeView.as_view(), name='sla-alert-acknowledge'),
]
