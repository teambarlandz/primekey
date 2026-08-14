import re
from rest_framework import serializers
from .models import ContactMessage

NIGERIAN_PHONE_REGEX = r"^(?:\+?234|0)[789][01]\d{8}$"


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["full_name", "email", "phone", "subject", "message"]

    def validate_phone(self, value):
        cleaned = re.sub(r"[\s\-\(\)]", "", value.strip())
        if not re.match(NIGERIAN_PHONE_REGEX, cleaned):
            raise serializers.ValidationError(
                "Please enter a valid Nigerian phone number (e.g., 08012345678)."
            )
        return cleaned

    def validate_message(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Message must be at least 20 characters.")
        return value.strip()
