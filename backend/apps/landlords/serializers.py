import re

from django.utils import timezone
from rest_framework import serializers

from core.files import allowed_upload_types, validate_upload
from .models import LandlordProfile, PropertyIntake, Appointment, DocumentVault

# Regex supporting local (080..., 070..., 090..., 081...) and international (+234... / 234...) formats
NIGERIAN_PHONE_REGEX = r'^(?:\+?234|0)[789][01]\d{8}$'

# Time slots offered for landlord consultation appointments
APPOINTMENT_TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']

MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10 MB


def document_download_url(request, doc):
    """Absolute URL of the authenticated document download endpoint."""
    relative = f"/api/v1/landlords/documents/{doc.id}/download/"
    if request:
        return request.build_absolute_uri(relative)
    return relative


class LandlordProfileSerializer(serializers.ModelSerializer):
    """Public-facing landlord profile.

    ``id_number`` (NDPR-sensitive) is excluded: it is only returned by
    ``LandlordProfileDetailSerializer`` to the owner or an agent.
    """

    class Meta:
        model = LandlordProfile
        fields = [
            'id', 'full_name', 'phone', 'email',
            'id_type',
            'property_count',
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


class LandlordProfileDetailSerializer(LandlordProfileSerializer):
    """Owner/agent-only view of a landlord profile (includes id_number)."""

    class Meta(LandlordProfileSerializer.Meta):
        fields = LandlordProfileSerializer.Meta.fields + ['id_number']


class PropertyIntakeSerializer(serializers.ModelSerializer):
    """Intake serializer.

    ``landlord`` is server-derived (never client-supplied) and ``status`` is
    forced to ``submitted`` on create, preventing mass assignment.
    """

    class Meta:
        model = PropertyIntake
        fields = [
            'id', 'landlord', 'title', 'property_type', 'price',
            'is_negotiable', 'address', 'city', 'state', 'area',
            'bedrooms', 'bathrooms', 'toilets', 'description',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'landlord', 'status', 'created_at', 'updated_at']

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
    """Appointment serializer.

    ``landlord`` and ``status`` are server-managed; clients cannot create or
    confirm appointments on behalf of another landlord.
    """

    class Meta:
        model = Appointment
        fields = [
            'id', 'landlord', 'preferred_date', 'time_slot',
            'tour_type', 'notes', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'landlord', 'status', 'created_at', 'updated_at']

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
        landlord = attrs.get('landlord') or self.context.get('_server_landlord')
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
        return document_download_url(self.context.get('request'), obj)

    def validate(self, attrs):
        file_field = attrs.get('file')
        if file_field:
            if file_field.size > MAX_DOCUMENT_SIZE:
                raise serializers.ValidationError({
                    "file": "File size must be 10MB or less."
                })
            # Magic-byte + extension allowlist validation (rejects HTML, JS,
            # SVG, executables, polyglot files, and extension spoofing).
            try:
                validate_upload(file_field)
            except ValueError as exc:
                raise serializers.ValidationError({"file": str(exc)})
        return attrs
