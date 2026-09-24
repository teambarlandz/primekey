from rest_framework import serializers
from .models import OTPCode


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    channel = serializers.ChoiceField(choices=['sms', 'email'], required=False)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'password_reset', 'agent_login'], default='login')

    def validate(self, attrs):
        phone = (attrs.get('phone') or '').strip()
        email = (attrs.get('email') or '').strip()
        channel = attrs.get('channel')
        # Require at least one identifier
        if not phone and not email:
            raise serializers.ValidationError({"phone": "Provide phone or email.", "email": "Provide phone or email."})
        # If channel is explicit, enforce matching identifier
        if channel == 'sms' and not phone:
            raise serializers.ValidationError({"phone": "Phone is required for SMS channel."})
        if channel == 'email' and not email:
            raise serializers.ValidationError({"email": "Email is required for email channel."})
        # Auto-infer channel if not provided
        if not channel:
            attrs['channel'] = 'email' if email and not phone else 'sms'
        return attrs

    def validate_phone(self, value):
        if not value:
            return value
        # Basic Nigerian phone validation
        import re
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if not re.match(r'^(?:\+?234|0)[789][01]\d{8}$', cleaned):
            raise serializers.ValidationError("Please enter a valid Nigerian phone number.")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    code = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'password_reset', 'agent_login'], default='login')

    def validate(self, attrs):
        phone = (attrs.get('phone') or '').strip()
        email = (attrs.get('email') or '').strip()
        if not phone and not email:
            raise serializers.ValidationError({"phone": "Provide phone or email.", "email": "Provide phone or email."})
        return attrs

    def validate_phone(self, value):
        if not value:
            return value
        import re
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if not re.match(r'^(?:\+?234|0)[789][01]\d{8}$', cleaned):
            raise serializers.ValidationError("Please enter a valid Nigerian phone number.")
        return value

    def validate_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Code must be a 6-digit number.")
        return value


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()