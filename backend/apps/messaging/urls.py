from django.urls import path
from .views import WhatsAppThreadListView, WhatsAppMessageListView

app_name = 'messaging'

urlpatterns = [
    path('threads/', WhatsAppThreadListView.as_view(), name='thread-list'),
    path('threads/<uuid:pk>/messages/', WhatsAppMessageListView.as_view(), name='message-list'),
]
