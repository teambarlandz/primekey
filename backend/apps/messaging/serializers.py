from rest_framework import serializers

from .models import WhatsAppThread, WhatsAppMessage


class WhatsAppMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppMessage
        fields = ['id', 'direction', 'body', 'created_at']


class WhatsAppThreadSerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    last_message = serializers.CharField(read_only=True)

    class Meta:
        model = WhatsAppThread
        fields = [
            'id', 'phone', 'display_name',
            'concierge_lead', 'landlord',
            'lead_name', 'last_message', 'last_message_at',
            'message_count', 'created_at', 'updated_at',
        ]

    def get_lead_name(self, obj):
        if obj.concierge_lead_id:
            return obj.concierge_lead.full_name
        if obj.landlord_id:
            return obj.landlord.full_name
        return obj.display_name

    def get_message_count(self, obj):
        return obj.messages.count()


class WhatsAppThreadCreateSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    display_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    concierge_lead = serializers.UUIDField(required=False)
    landlord = serializers.UUIDField(required=False)
    message = serializers.CharField(max_length=2000, required=False, allow_blank=True)


class WhatsAppMessageCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=2000)
