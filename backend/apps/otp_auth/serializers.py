from rest_framework import serializers
from .models import OTPCode


class SendOTPSerializer(serializers.Serializer):
    """Email is the only OTP channel — SMS delivery was removed."""

    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['login', 'register', 'password_reset', 'agent_login'], default='login')

    def validate_email(self, value):
        return value.strip()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'password_reset', 'agent_login'], default='login')

    def validate_email(self, value):
        return value.strip()

    def validate_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Code must be a 6-digit number.")
        return value


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()