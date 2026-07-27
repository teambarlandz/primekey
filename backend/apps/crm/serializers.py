import re
from rest_framework import serializers
from .models import ConciergeLead, ConsentLog


class ConciergeLeadSerializer(serializers.ModelSerializer):
    # Match the NDPR consent payload requirement from frontend
    ndprConsent = serializers.BooleanField(write_only=True, required=True)

    class Meta:
        model = ConciergeLead
        fields = [
            "id",
            "full_name",
            "phone",
            "email",
            "preferred_location",
            "property_type",
            "budget_min",
            "budget_max",
            "bedrooms",
            "status",
            "lead_score",
            "ndprConsent",
            "created_at",
        ]
        read_only_fields = ["id", "status", "lead_score", "created_at"]

    def validate_phone(self, value):
        """
        Validate Nigerian phone number format matching frontend regex:
        ^(?:\+234|234|0)[789][01]\d{8}$
        """
        cleaned_phone = re.sub(r"\s+", "", value)
        pattern = r"^(?:\+234|234|0)[789][01]\d{8}$"
        if not re.match(pattern, cleaned_phone):
            raise serializers.ValidationError(
                "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)."
            )
        return cleaned_phone

    def validate_ndprConsent(self, value):
        """
        Ensure user explicitly accepted NDPR guidelines.
        """
        if not value:
            raise serializers.ValidationError(
                "You must agree to data processing under NDPR guidelines."
            )
        return value

    def create(self, validated_data):
        """
        Create ConciergeLead and automatically record an immutable NDPR ConsentLog.
        """
        # Pop write-only consent flag before lead creation
        ndpr_consent = validated_data.pop("ndprConsent")

        # Extract IP and User-Agent if passed via context from the view
        request = self.context.get("request")
        ip_address = None
        user_agent = None

        if request:
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(",")[0].strip()
            else:
                ip_address = request.META.get("REMOTE_ADDR")

            user_agent = request.META.get("HTTP_USER_AGENT", "")

        # Create the Lead record
        lead = ConciergeLead.objects.create(**validated_data)

        # Create the corresponding NDPR ConsentLog record
        ConsentLog.objects.create(
            lead=lead,
            ip_address=ip_address,
            user_agent=user_agent,
            consent_given=ndpr_consent,
            terms_version="1.0",
        )

        return lead
