from rest_framework import serializers
from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for listing a user's favorited properties."""

    property_id = serializers.UUIDField(source="property.id", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_price = serializers.DecimalField(
        source="property.price", max_digits=12, decimal_places=2, read_only=True
    )
    property_image = serializers.SerializerMethodField()
    property_location = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = [
            "id",
            "property_id",
            "property_title",
            "property_price",
            "property_image",
            "property_location",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_property_image(self, obj):
        primary = obj.property.images.filter(is_primary=True).first()
        if primary:
            return primary.image_url
        first = obj.property.images.first()
        return first.image_url if first else None

    def get_property_location(self, obj):
        return f"{obj.property.area}, {obj.property.city}"


class FavoriteCreateSerializer(serializers.Serializer):
    """Serializer for adding/removing a favorite."""

    property_id = serializers.UUIDField()

    def validate_property_id(self, value):
        from apps.properties.models import Property

        if not Property.objects.filter(id=value, status="available").exists():
            raise serializers.ValidationError(
                "Property not found or no longer available."
            )
        return value
