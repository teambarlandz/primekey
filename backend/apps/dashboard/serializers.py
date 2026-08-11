from django.utils import timezone
from rest_framework import serializers
from apps.landlords.models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from apps.landlords.serializers import APPOINTMENT_TIME_SLOTS, document_download_url
from apps.crm.models import ConciergeLead


class DashboardDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    landlord_phone = serializers.CharField(source='landlord.phone', read_only=True)
    intake_title = serializers.CharField(source='intake.title', read_only=True, default=None)
    doc_type_label = serializers.CharField(source='get_doc_type_display', read_only=True)

    class Meta:
        model = DocumentVault
        fields = [
            'id', 'landlord_name', 'landlord_phone', 'intake_title',
            'doc_type', 'doc_type_label', 'file_url',
            'review_status', 'review_notes',
            'uploaded_at', 'reviewed_at',
        ]

    def get_file_url(self, obj):
        return document_download_url(self.context.get('request'), obj)


class DocumentReviewSerializer(serializers.Serializer):
    review_status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected'],
        error_messages={"invalid_choice": "Invalid review status."},
    )
    review_notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)


class DashboardLandlordSerializer(serializers.ModelSerializer):
    intake_count = serializers.SerializerMethodField()
    appointment_count = serializers.SerializerMethodField()

    class Meta:
        model = LandlordProfile
        fields = [
            'id', 'full_name', 'phone', 'email', 'id_type',
            'verification_status', 'property_count',
            'intake_count', 'appointment_count',
            'created_at', 'updated_at',
        ]

    def get_intake_count(self, obj):
        return obj.properties.count()

    def get_appointment_count(self, obj):
        return obj.appointments.count()


class DashboardIntakeSerializer(serializers.ModelSerializer):
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    landlord_phone = serializers.CharField(source='landlord.phone', read_only=True)

    class Meta:
        model = PropertyIntake
        fields = [
            'id', 'title', 'property_type', 'price', 'is_negotiable',
            'address', 'area', 'city', 'state',
            'bedrooms', 'bathrooms', 'toilets',
            'status', 'landlord_name', 'landlord_phone',
            'created_at', 'updated_at',
        ]


class DashboardAppointmentSerializer(serializers.ModelSerializer):
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    landlord_phone = serializers.CharField(source='landlord.phone', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'preferred_date', 'time_slot', 'tour_type',
            'notes', 'status', 'landlord_name', 'landlord_phone',
            'created_at', 'updated_at',
        ]


class DashboardSummarySerializer(serializers.Serializer):
    total_landlords = serializers.IntegerField()
    landlords_pending_verification = serializers.IntegerField()
    total_intakes = serializers.IntegerField()
    intakes_submitted = serializers.IntegerField()
    intakes_approved = serializers.IntegerField()
    intakes_rejected = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    appointments_pending = serializers.IntegerField()
    appointments_confirmed = serializers.IntegerField()
    total_concierge_leads = serializers.IntegerField()
    leads_new_7d = serializers.IntegerField()
    leads_hot = serializers.IntegerField()
    leads_warm = serializers.IntegerField()
    leads_cold = serializers.IntegerField()
    leads_sla_breached = serializers.IntegerField()


class DashboardLeadSerializer(serializers.ModelSerializer):
    tier = serializers.CharField(source='score_breakdown.tier', read_only=True, default=None)
    priority_score = serializers.IntegerField(source='score_breakdown.total_score', read_only=True, default=0)
    assigned_agent = serializers.SerializerMethodField()
    listing_title = serializers.CharField(source='listing.title', read_only=True, default=None)

    class Meta:
        model = ConciergeLead
        fields = [
            'id', 'full_name', 'phone', 'email',
            'preferred_location', 'property_type', 'budget_max',
            'status', 'tier', 'priority_score',
            'is_sla_breached', 'sla_deadline', 'sla_remaining_minutes',
            'assigned_agent', 'listing_title', 'inquiry_message',
            'created_at',
        ]

    def get_assigned_agent(self, obj):
        agent = obj.assigned_agent
        if not agent:
            return None
        return getattr(agent, 'username', None)


class LandlordVerificationUpdateSerializer(serializers.Serializer):
    verification_status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected'],
        error_messages={"invalid_choice": "Invalid verification status."},
    )


class IntakeStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['submitted', 'approved', 'rejected'],
        error_messages={"invalid_choice": "Invalid intake status."},
    )


class AppointmentUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['pending', 'confirmed', 'completed', 'cancelled'],
        required=False,
        error_messages={"invalid_choice": "Invalid appointment status."},
    )
    preferred_date = serializers.DateField(required=False)
    time_slot = serializers.ChoiceField(
        choices=APPOINTMENT_TIME_SLOTS,
        required=False,
        error_messages={"invalid_choice": "Invalid time slot."},
    )

    def validate(self, attrs):
        if attrs.get("preferred_date") and attrs.get("preferred_date") < timezone.localdate():
            raise serializers.ValidationError({"preferred_date": "Preferred date cannot be in the past."})
        return attrs
