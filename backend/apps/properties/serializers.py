from rest_framework import serializers
from .models import Property, PropertyImage, InspectionRequest


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'caption', 'is_primary']


class PropertyListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for search results grid views.
    """
    images = PropertyImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Property
        fields = [
            'id',
            'title',
            'purpose',
            'purpose_display',
            'property_type',
            'property_type_display',
            'price',
            'currency',
            'is_negotiable',
            'address',
            'area',
            'city',
            'state',
            'bedrooms',
            'bathrooms',
            'toilets',
            'is_serviced',
            'is_furnished',
            'status',
            'status_display',
            'is_featured',
            'images',
            'primary_image',
            'created_at',
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        return PropertyImageSerializer(primary).data if primary else None


class PropertyDetailSerializer(serializers.ModelSerializer):
    """
    Detailed view serializer for individual listing detail pages.
    """
    images = PropertyImageSerializer(many=True, read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Property
        fields = '__all__'


class InspectionRequestCreateSerializer(serializers.ModelSerializer):
    """Create a buyer-facing inspection request for a property."""

    class Meta:
        model = InspectionRequest
        fields = [
            'full_name', 'phone', 'email',
            'preferred_date', 'time_slot', 'tour_type', 'notes',
        ]

    def validate_time_slot(self, value):
        allowed = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
        if value not in allowed:
            raise serializers.ValidationError(f"Time slot must be one of: {', '.join(allowed)}")
        return value

    def validate_tour_type(self, value):
        allowed = ['in_person', 'virtual']
        if value not in allowed:
            raise serializers.ValidationError("Tour type must be 'in_person' or 'virtual'.")
        return value


class InspectionRequestSerializer(serializers.ModelSerializer):
    """Read serializer for inspection requests."""
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_location = serializers.SerializerMethodField()

    class Meta:
        model = InspectionRequest
        fields = [
            'id', 'property', 'property_title', 'property_location',
            'full_name', 'phone', 'email',
            'preferred_date', 'time_slot', 'tour_type', 'notes',
            'status', 'created_at',
        ]

    def get_property_location(self, obj):
        return f"{obj.property.area}, {obj.property.city}"
