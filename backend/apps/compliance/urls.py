from django.urls import path
from .views import (
    ExportRequestCreateView, ExportRequestVerifyView, ExportRequestStatusView,
    ExportDownloadView,
    ErasureRequestCreateView, ErasureRequestVerifyView, ErasureRequestStatusView,
    AnonymizationLogListView, ConsentLogListView
)

app_name = 'compliance'

urlpatterns = [
    # Data Export (Right of Access - NDPR Art 27)
    path('export/', ExportRequestCreateView.as_view(), name='export-request'),
    path('export/verify/', ExportRequestVerifyView.as_view(), name='export-verify'),
    path('export/download/<uuid:pk>/', ExportDownloadView.as_view(), name='export-download'),
    path('export/<uuid:pk>/', ExportRequestStatusView.as_view(), name='export-status'),
    
    # Data Erasure (Right to Erasure - NDPR Art 28)
    path('erase/', ErasureRequestCreateView.as_view(), name='erase-request'),
    path('erase/verify/', ErasureRequestVerifyView.as_view(), name='erase-verify'),
    path('erase/<uuid:pk>/', ErasureRequestStatusView.as_view(), name='erase-status'),
    
    # Audit Logs (Admin)
    path('anonymization-logs/', AnonymizationLogListView.as_view(), name='anonymization-logs'),
    path('consent-logs/', ConsentLogListView.as_view(), name='consent-logs'),
]