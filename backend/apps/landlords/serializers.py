import re

from rest_framework import serializers
from .models import LandlordProfile, PropertyIntake, Appointment

# Regex supporting local (080..., 070..., 090..., 081...) and international (+234... / 234...) formats
NIGERIAN_PHONE_REGEX = r'^(?:\+?234|0)[789][01]\d{8}$'


class LandlordProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandlordProfile
        fields = [
            'id', 'full_name', 'phone', 'email',
            'id_type', 'id_number', 'property_count',
            'ndpr_consent',
            'verification_status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'verification_status', 'created_at', 'updated_at']

    def validate_phone(self, value: str) -> str:
        cleaned_phone = re.sub(r'[\s\-\(\)]', '', value.strip())
        if not re.match(NIGERIAN_PHONE_REGEX, cleaned_phone):
            raise serializers.ValidationError(
                "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)."
            )
        return cleaned_phone

    def validate_ndpr_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("You must accept the privacy policy.")
        return value

    def validate(self, attrs):
        # Consent is mandatory even when omitted from the request payload
        if attrs.get("ndpr_consent") is not True:
            raise serializers.ValidationError({
                "ndpr_consent": "You must accept the privacy policy."
            })
        return attrs


class PropertyIntakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyIntake
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
