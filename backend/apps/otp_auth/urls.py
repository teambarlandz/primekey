from django.urls import path
from .views import SendOTPView, VerifyOTPView

app_name = 'otp_auth'

urlpatterns = [
    path('send/', SendOTPView.as_view(), name='send-otp'),
    path('verify/', VerifyOTPView.as_view(), name='verify-otp'),
]