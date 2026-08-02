from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient_type', 'recipient_id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = fields


class NotificationReadSerializer(serializers.Serializer):
    is_read = serializers.BooleanField()
