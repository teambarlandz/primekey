from django.urls import path
from .views import PropertySearchView, PropertyDetailView, PropertyInquirySubmitView

app_name = 'properties'

urlpatterns = [
    path('search/', PropertySearchView.as_view(), name='property-search'),
    path('properties/<uuid:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('properties/<uuid:pk>/inquiries/', PropertyInquirySubmitView.as_view(), name='property-inquiry'),
]
