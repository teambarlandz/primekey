from rest_framework import serializers
from .models import OTPCode


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'password_reset', 'agent_login'], default='login')

    def validate_phone(self, value):
        # Basic Nigerian phone validation
        import re
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if not re.match(r'^(?:\+?234|0)[789][01]\d{8}$', cleaned):
            raise serializers.ValidationError("Please enter a valid Nigerian phone number.")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    code = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'password_reset', 'agent_login'], default='login')

    def validate_phone(self, value):
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