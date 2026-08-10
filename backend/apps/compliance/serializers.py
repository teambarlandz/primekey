from django.utils import timezone
from rest_framework import serializers

from core.security import generate_secure_code, hash_code
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
        # Generate a cryptographically secure 6-digit verification code.
        # Only its SHA-256 hash is persisted.
        code = generate_secure_code(6)
        validated_data['verification_code'] = hash_code(code)
        validated_data['verification_sent_at'] = timezone.now()
        
        export_request = ExportRequest.objects.create(**validated_data)
        
        # TODO: Send the plaintext code to the subject's email/SMS provider.
        # The code is deliberately not stored or returned anywhere.
        
        return export_request


class ExportRequestVerifySerializer(serializers.Serializer):
    """
    Verify export request with 6-digit code.
    """
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        export_request = ExportRequest.objects.filter(
            email=attrs['email'],
            status='pending',
        ).order_by('-created_at').first()
        
        if export_request is None:
            raise serializers.ValidationError("No pending export request found for this email.")
        
        if export_request.verification_attempts >= 5:
            raise serializers.ValidationError("Too many failed attempts. Request a new code.")
        
        # Check code expiry (15 minutes)
        if export_request.verification_sent_at:
            if (timezone.now() - export_request.verification_sent_at).total_seconds() > 900:
                raise serializers.ValidationError("Verification code has expired.")
        
        export_request.verification_attempts += 1
        export_request.save(update_fields=['verification_attempts'])
        
        if export_request.verification_code != hash_code(attrs['code']):
            raise serializers.ValidationError("Invalid or expired verification code.")
        
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
        # Generate a cryptographically secure 6-digit verification code.
        # Only its SHA-256 hash is persisted.
        code = generate_secure_code(6)
        validated_data['verification_code'] = hash_code(code)
        validated_data['verification_sent_at'] = timezone.now()
        
        erasure_request = ErasureRequest.objects.create(**validated_data)
        
        # TODO: Send the plaintext code to the subject's email/SMS provider.
        
        return erasure_request


class ErasureRequestVerifySerializer(serializers.Serializer):
    """
    Verify erasure request with 6-digit code.
    """
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        erasure_request = ErasureRequest.objects.filter(
            email=attrs['email'],
            status='pending',
        ).order_by('-created_at').first()
        
        if erasure_request is None:
            raise serializers.ValidationError("No pending erasure request found for this email.")
        
        if erasure_request.verification_attempts >= 5:
            raise serializers.ValidationError("Too many failed attempts. Request a new code.")
        
        if erasure_request.verification_sent_at:
            if (timezone.now() - erasure_request.verification_sent_at).total_seconds() > 900:
                raise serializers.ValidationError("Verification code has expired.")
        
        erasure_request.verification_attempts += 1
        erasure_request.save(update_fields=['verification_attempts'])
        
        if erasure_request.verification_code != hash_code(attrs['code']):
            raise serializers.ValidationError("Invalid or expired verification code.")
        
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