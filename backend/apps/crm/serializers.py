import re
from rest_framework import serializers
from .models import ConciergeLead, ConsentLog, LeadScore, SLAAlert

# Regex supporting local (080..., 070..., 090..., 081...) and international (+234... / 234...) formats
NIGERIAN_PHONE_REGEX = r'^(?:\+?234|0)[789][01]\d{8}$'


class LeadScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadScore
        fields = [
            'budget_match_score',
            'location_match_score',
            'property_type_match_score',
            'bedrooms_match_score',
            'completeness_score',
            'urgency_score',
            'total_score',
            'calculated_at',
        ]


class SLAAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLAAlert
        fields = [
            'id',
            'severity',
            'message',
            'acknowledged',
            'acknowledged_by',
            'acknowledged_at',
            'created_at',
        ]
        read_only_fields = fields


class ConciergeLeadSerializer(serializers.ModelSerializer):
    """
    Serializer for validating and saving incoming 2-Week Concierge leads.
    Expects snake_case keys sent by the Next.js frontend payload.
    """
    sla_deadline = serializers.DateTimeField(read_only=True)
    lead_score = serializers.IntegerField(read_only=True)
    is_sla_breached = serializers.BooleanField(read_only=True)
    sla_remaining_minutes = serializers.IntegerField(read_only=True)
    score_breakdown = LeadScoreSerializer(read_only=True)
    sla_alerts = SLAAlertSerializer(many=True, read_only=True)
    assigned_agent_name = serializers.CharField(source='assigned_agent.get_full_name', read_only=True)

    class Meta:
        model = ConciergeLead
        fields = [
            'id',
            'full_name',
            'phone',
            'email',
            'preferred_location',
            'property_type',
            'budget_min',
            'budget_max',
            'bedrooms',
            'ndpr_consent',
            'status',
            'lead_score',
            'is_sla_breached',
            'sla_remaining_minutes',
            'sla_deadline',
            'assigned_agent',
            'assigned_agent_name',
            'score_breakdown',
            'sla_alerts',
            'created_at',
        ]
        read_only_fields = [
            'id', 'status', 'lead_score', 'is_sla_breached', 
            'sla_remaining_minutes', 'sla_deadline', 
            'assigned_agent', 'assigned_agent_name',
            'score_breakdown', 'sla_alerts', 'created_at'
        ]

    def validate_full_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters long.")
        return value

    def validate_phone(self, value: str) -> str:
        # Strip spaces, dashes, and parentheses automatically before validating
        cleaned_phone = re.sub(r'[\s\-\(\)]', '', value.strip())

        if not re.match(NIGERIAN_PHONE_REGEX, cleaned_phone):
            raise serializers.ValidationError(
                "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)."
            )
        return cleaned_phone

    def validate_email(self, value: str | None) -> str | None:
        if not value or not value.strip():
            return None
        return value.strip().lower()

    def validate_preferred_location(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Target location is required.")
        return value

    def validate_ndpr_consent(self, value: bool) -> bool:
        if value is not True:
            raise serializers.ValidationError(
                "You must accept the NDPR privacy policy to activate concierge sourcing."
            )
        return value

    def validate(self, attrs):
        """
        Cross-field validation: Ensure budget_min <= budget_max.
        """
        budget_min = attrs.get('budget_min', 0)
        budget_max = attrs.get('budget_max', 500000000)

        if budget_min is not None and budget_max is not None and budget_min > budget_max:
            raise serializers.ValidationError({
                "budget_min": "Minimum budget cannot exceed maximum budget."
            })

        return attrs

    def create(self, validated_data):
        """
        Create the lead and automatically record an NDPR ConsentLog entry.
        """
        request = self.context.get('request')
        lead = ConciergeLead.objects.create(**validated_data)

        # Extract client IP & User-Agent for legal audit logging
        ip_address = None
        user_agent = None

        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')

            user_agent = request.META.get('HTTP_USER_AGENT')

        # Log consent for compliance audit trail
        ConsentLog.objects.create(
            lead=lead,
            ip_address=ip_address,
            user_agent=user_agent
        )

        return lead


class ConsentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentLog
        fields = ['id', 'ip_address', 'user_agent', 'consent_text', 'created_at']
        read_only_fields = fields