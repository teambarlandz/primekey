import re

from django.utils import timezone
from rest_framework import serializers
from .models import LandlordProfile, PropertyIntake, Appointment, DocumentVault

# Regex supporting local (080..., 070..., 090..., 081...) and international (+234... / 234...) formats
NIGERIAN_PHONE_REGEX = r'^(?:\+?234|0)[789][01]\d{8}$'

# Time slots offered for landlord consultation appointments
APPOINTMENT_TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']


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

    def validate_price(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_bedrooms(self, value):
        if value < 1:
            raise serializers.ValidationError("Bedrooms must be at least 1.")
        return value

    def validate_bathrooms(self, value):
        if value < 1:
            raise serializers.ValidationError("Bathrooms must be at least 1.")
        return value

    def validate_toilets(self, value):
        if value < 1:
            raise serializers.ValidationError("Toilets must be at least 1.")
        return value

    def create(self, validated_data):
        validated_data['status'] = 'submitted'
        return super().create(validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_preferred_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Preferred date cannot be in the past.")
        return value

    def validate_time_slot(self, value):
        if value not in APPOINTMENT_TIME_SLOTS:
            raise serializers.ValidationError(
                f"Time slot must be one of: {', '.join(APPOINTMENT_TIME_SLOTS)}."
            )
        return value

    def validate(self, attrs):
        landlord = attrs.get('landlord')
        preferred_date = attrs.get('preferred_date')
        time_slot = attrs.get('time_slot')

        if landlord and preferred_date and time_slot:
            exists = Appointment.objects.filter(
                landlord=landlord,
                preferred_date=preferred_date,
                time_slot=time_slot,
            ).exclude(status='cancelled').exists()
            if exists:
                raise serializers.ValidationError({
                    "time_slot": "This time slot is already booked for the selected date."
                })
        return attrs


class DocumentVaultSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    intake_title = serializers.CharField(source='intake.title', read_only=True, default=None)

    class Meta:
        model = DocumentVault
        fields = [
            'id', 'landlord', 'landlord_name', 'intake', 'intake_title',
            'doc_type', 'file', 'file_url',
            'review_status', 'review_notes',
            'uploaded_at', 'reviewed_at',
        ]
        read_only_fields = [
            'id', 'landlord', 'review_status', 'review_notes',
            'uploaded_at', 'reviewed_at',
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        url = obj.file.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def validate(self, attrs):
        file_field = attrs.get('file')
        if file_field:
            max_size = 10 * 1024 * 1024
            if file_field.size > max_size:
                raise serializers.ValidationError({
                    "file": "File size must be 10MB or less."
                })
        return attrs
