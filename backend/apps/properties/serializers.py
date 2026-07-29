from rest_framework import serializers
from .models import Property, PropertyImage


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'caption', 'is_primary', 'created_at']


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'property_type', 'property_type_display',
            'price', 'currency', 'is_negotiable',
            'address', 'city', 'state', 'area',
            'bedrooms', 'bathrooms', 'toilets',
            'is_serviced', 'is_furnished',
            'status', 'status_display', 'is_featured',
            'images', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class PropertySearchSerializer(serializers.Serializer):
    location = serializers.CharField(required=False, allow_blank=True)
    property_type = serializers.ChoiceField(
        choices=[
            ('any', 'Any'),
            ('self_contain', 'Self-Contain / Studio'),
            ('room_and_parlour', 'Room & Parlour Self-Contain'),
            ('single_room', 'Single Room / Tenement'),
            ('bq', 'Boys\' Quarters (BQ)'),
            ('short_let', 'Short Let / Serviced Apartment'),
            ('flat', 'Standard Flat / Apartment'),
            ('maisonette', 'Maisonette'),
            ('bungalow', 'Bungalow'),
            ('terrace_duplex', 'Terraced Duplex / Townhouse'),
            ('semi_detached_duplex', 'Semi-Detached Duplex'),
            ('fully_detached_duplex', 'Fully Detached Duplex'),
            ('penthouse', 'Penthouse'),
            ('mansion', 'Mansion / Luxury Villa'),
            ('land', 'Residential / Commercial Land'),
            ('commercial', 'Shop / Office / Commercial Space'),
        ],
        required=False,
        default='any'
    )
    min_price = serializers.IntegerField(min_value=0, default=0)
    max_price = serializers.IntegerField(min_value=0, default=500000000)
    bedrooms = serializers.CharField(required=False, default='any')
    page = serializers.IntegerField(min_value=1, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=50, default=12)
    ordering = serializers.ChoiceField(
        choices=['-created_at', 'created_at', 'price', '-price', '-is_featured'],
        required=False,
        default='-is_featured'
    )