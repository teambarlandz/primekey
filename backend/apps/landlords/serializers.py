from rest_framework import serializers
from .models import LandlordProfile, PropertyIntake, Appointment


class LandlordProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandlordProfile
        fields = [
            'id', 'full_name', 'phone', 'email',
            'id_type', 'id_number', 'property_count',
            'ndpr_consent',
            'verification_status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'verification_status', 'created_at', 'updated_at']

    def validate_ndpr_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("You must accept the privacy policy.")
        return value


class PropertyIntakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyIntake
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
