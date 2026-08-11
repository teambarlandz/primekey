from django.utils import timezone
from rest_framework import serializers

from core.security import (
    check_and_record_failure,
    clear_failures,
    generate_secure_code,
    hash_code,
    remaining_lock,
    verify_code,
)
from .models import (
    ConsentLog, ExportRequest, ErasureRequest, AnonymizationLog
)

# Global per-email brute-force lockout shared across ALL requests for the same
# email address. Deliberately NOT reset when a new request is created.
COMPLIANCE_LOCK_PREFIX = "compliance_verify_lock:"
COMPLIANCE_MAX_ATTEMPTS = 3
COMPLIANCE_LOCK_SECONDS = 300


def _verify_email_code(model, attrs, *, code_field="code", result_key):
    """
    Shared verification logic for export/erasure codes.

    - Finds the latest pending request for the email.
    - Enforces the global per-email lockout (does not reset on new requests).
    - Enforces the per-request attempt cap.
    - Constant-time code comparison via ``verify_code``.
    """
    email = (attrs.get("email") or "").strip().lower()
    if not email:
        raise serializers.ValidationError("A valid email is required.")

    lock_key = f"{COMPLIANCE_LOCK_PREFIX}{email}"
    if remaining_lock(lock_key) > 0:
        raise serializers.ValidationError(
            "Too many failed attempts. Try again in a few minutes."
        )

    request_obj = model.objects.filter(
        email=email,
        status='pending',
    ).order_by('-created_at').first()

    if request_obj is None:
        raise serializers.ValidationError(
            f"No pending {model.__name__} found for this email."
        )

    if request_obj.verification_attempts >= 5:
        raise serializers.ValidationError("Too many failed attempts. Request a new code.")

    # Check code expiry (15 minutes)
    if request_obj.verification_sent_at:
        if (timezone.now() - request_obj.verification_sent_at).total_seconds() > 900:
            raise serializers.ValidationError("Verification code has expired.")

    if not verify_code(request_obj.verification_code, attrs.get(code_field, "")):
        request_obj.verification_attempts += 1
        request_obj.save(update_fields=['verification_attempts'])
        check_and_record_failure(
            lock_key,
            max_attempts=COMPLIANCE_MAX_ATTEMPTS,
            lock_seconds=COMPLIANCE_LOCK_SECONDS,
        )
        raise serializers.ValidationError("Invalid or expired verification code.")

    clear_failures(lock_key)
    attrs[result_key] = request_obj
    return attrs


def _remaining_lock(lock_key):
    from django.core.cache import cache

    return cache.get(lock_key, 0) or 0


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
        return _verify_email_code(
            ExportRequest,
            attrs,
            result_key='export_request',
        )


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
        return _verify_email_code(
            ErasureRequest,
            attrs,
            result_key='erasure_request',
        )


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