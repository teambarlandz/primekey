from rest_framework import serializers
from .models import (
    ConsentLog, ExportRequest, ErasureRequest, AnonymizationLog
)


class ConsentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentLog
        fields = [
            'id', 'email', 'phone', 'purpose', 'consent_given',
            'consent_text', 'version', 'legal_basis',
            'ip_address', 'user_agent', 'referrer',
            'withdrawn', 'withdrawn_at', 'withdrawal_method',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ExportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportRequest
        fields = [
            'id', 'email', 'phone', 'status', 'include_metadata',
            'reason', 'verified_at', 'download_url', 'records_count',
            'expires_at', 'completed_at', 'errors', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ExportRequestCreateSerializer(serializers.ModelSerializer):
    """
    Public serializer for submitting export requests.
    """
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    class Meta:
        model = ExportRequest
        fields = ['email', 'phone', 'include_metadata', 'reason']
    
    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError(
                "Either email or phone number is required."
            )
        return attrs
    
    def create(self, validated_data):
        import random
        import string
        from django.utils import timezone
        from django.core.mail import send_mail
        
        # Generate 6-digit verification code
        code = ''.join(random.choices(string.digits, k=6))
        validated_data['verification_code'] = code
        validated_data['verification_sent_at'] = timezone.now()
        
        export_request = ExportRequest.objects.create(**validated_data)
        
        # TODO: Send verification email/SMS
        # send_mail(
        #     subject='Verify Your Data Export Request',
        #     message=f'Your verification code is: {code}',
        #     from_email=settings.DEFAULT_FROM_EMAIL,
        #     recipient_list=[export_request.email],
        # )
        
        return export_request


class ExportRequestVerifySerializer(serializers.Serializer):
    """
    Verify export request with 6-digit code.
    """
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        try:
            export_request = ExportRequest.objects.get(
                email=attrs['email'],
                verification_code=attrs['code'],
                status='pending'
            )
        except ExportRequest.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification code.")
        
        if export_request.verification_attempts >= 5:
            raise serializers.ValidationError("Too many failed attempts. Request a new code.")
        
        # Check code expiry (15 minutes)
        if export_request.verification_sent_at:
            from django.utils import timezone
            if (timezone.now() - export_request.verification_sent_at).total_seconds() > 900:
                raise serializers.ValidationError("Verification code has expired.")
        
        attrs['export_request'] = export_request
        return attrs


class ErasureRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErasureRequest
        fields = [
            'id', 'email', 'phone', 'status', 'reason',
            'verified_at', 'records_erased', 'rejected',
            'rejection_reason', 'errors', 'completed_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ErasureRequestCreateSerializer(serializers.ModelSerializer):
    """
    Public serializer for submitting erasure requests.
    """
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    class Meta:
        model = ErasureRequest
        fields = ['email', 'phone', 'reason']
    
    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError(
                "Either email or phone number is required."
            )
        return attrs
    
    def create(self, validated_data):
        import random
        import string
        from django.utils import timezone
        
        # Generate 6-digit verification code
        code = ''.join(random.choices(string.digits, k=6))
        validated_data['verification_code'] = code
        validated_data['verification_sent_at'] = timezone.now()
        
        erasure_request = ErasureRequest.objects.create(**validated_data)
        
        # TODO: Send verification email/SMS
        return erasure_request


class ErasureRequestVerifySerializer(serializers.Serializer):
    """
    Verify erasure request with 6-digit code.
    """
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        try:
            erasure_request = ErasureRequest.objects.get(
                email=attrs['email'],
                verification_code=attrs['code'],
                status='pending'
            )
        except ErasureRequest.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification code.")
        
        if erasure_request.verification_attempts >= 5:
            raise serializers.ValidationError("Too many failed attempts. Request a new code.")
        
        attrs['erasure_request'] = erasure_request
        return attrs


class AnonymizationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnonymizationLog
        fields = [
            'id', 'lead_id', 'lead_phone', 'lead_email',
            'fields_anonymized', 'original_data_hash',
            'trigger', 'triggered_by', 'related_request_id',
            'created_at',
        ]
        read_only_fields = fields