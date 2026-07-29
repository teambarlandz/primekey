import pytest
import uuid
from rest_framework.test import APIClient
from rest_framework import status
from django.test import RequestFactory

from .models import Property, PropertyImage
from .serializers import PropertySearchSerializer, PropertySerializer, PropertyImageSerializer
from .views import PropertySearchView, PropertyDetailView


# =====================================================================
# FACTORIES
# =====================================================================

class PropertyFactory:
    @staticmethod
    def create(overrides=None):
        data = {
            'title': 'Luxury 3-Bedroom Flat',
            'description': 'A beautiful flat in Lekki',
            'property_type': 'flat',
            'price': 80_000_000,
            'address': '42 Admiralty Way',
            'city': 'Lekki',
            'state': 'Lagos',
            'area': 'Lekki Phase 1',
            'bedrooms': 3,
            'bathrooms': 2,
            'toilets': 2,
            'status': 'available',
        }
        if overrides:
            data.update(overrides)
        return Property.objects.create(**data)


class PropertyImageFactory:
    @staticmethod
    def create(property_obj, overrides=None):
        data = {
            'property': property_obj,
            'image_url': 'https://example.com/image.jpg',
            'is_primary': False,
        }
        if overrides:
            data.update(overrides)
        return PropertyImage.objects.create(**data)


# =====================================================================
# MODEL TESTS
# =====================================================================

class TestPropertyModel:
    def test_create_property(self, db):
        prop = PropertyFactory.create()
        assert prop.title == 'Luxury 3-Bedroom Flat'
        assert prop.property_type == 'flat'
        assert prop.status == 'available'
        assert isinstance(prop.id, uuid.UUID)

    def test_default_price(self, db):
        prop = PropertyFactory.create()
        assert float(prop.price) == 80_000_000

    def test_str_representation(self, db):
        prop = PropertyFactory.create()
        expected = f"Luxury 3-Bedroom Flat - ₦80,000,000.00 (Lekki Phase 1, Lekki)"
        assert str(prop) == expected

    def test_ordering(self, db):
        import time
        a = PropertyFactory.create({'title': 'A'})
        time.sleep(0.01)
        b = PropertyFactory.create({'title': 'B'})
        qs = Property.objects.all()
        assert list(qs) == [b, a]

    def test_all_property_types(self, db):
        types = [t[0] for t in Property.PROPERTY_TYPE_CHOICES]
        expected = [
            'self_contain', 'room_and_parlour', 'single_room', 'bq',
            'short_let', 'flat', 'maisonette', 'bungalow',
            'terrace_duplex', 'semi_detached_duplex', 'fully_detached_duplex',
            'penthouse', 'mansion', 'land', 'commercial',
        ]
        assert types == expected


class TestPropertyImageModel:
    def test_create_image(self, db):
        prop = PropertyFactory.create()
        img = PropertyImageFactory.create(prop)
        assert img.property == prop
        assert img.image_url == 'https://example.com/image.jpg'

    def test_primary_image_first(self, db):
        prop = PropertyFactory.create()
        img1 = PropertyImageFactory.create(prop, {'is_primary': False})
        img2 = PropertyImageFactory.create(prop, {'is_primary': True})
        assert list(prop.images.all()) == [img2, img1]

    def test_related_name(self, db):
        prop = PropertyFactory.create()
        PropertyImageFactory.create(prop)
        assert prop.images.count() == 1


# =====================================================================
# SERIALIZER TESTS
# =====================================================================

class TestPropertySerializer:
    def test_serializes_all_fields(self, db):
        prop = PropertyFactory.create()
        serializer = PropertySerializer(prop)
        assert serializer.data['title'] == 'Luxury 3-Bedroom Flat'
        assert serializer.data['property_type'] == 'flat'
        assert serializer.data['images'] == []

    def test_includes_images(self, db):
        prop = PropertyFactory.create()
        PropertyImageFactory.create(prop)
        serializer = PropertySerializer(prop)
        assert len(serializer.data['images']) == 1

    def test_display_fields(self, db):
        prop = PropertyFactory.create()
        serializer = PropertySerializer(prop)
        assert serializer.data['property_type_display'] == 'Standard Flat / Apartment'
        assert serializer.data['status_display'] == 'Available'


class TestPropertySearchSerializer:
    def test_defaults(self):
        serializer = PropertySearchSerializer(data={})
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data['property_type'] == 'any'
        assert serializer.validated_data['min_price'] == 0
        assert serializer.validated_data['max_price'] == 500_000_000
        assert serializer.validated_data['page'] == 1
        assert serializer.validated_data['page_size'] == 12

    def test_valid_choice(self):
        serializer = PropertySearchSerializer(data={'property_type': 'flat'})
        assert serializer.is_valid(), serializer.errors

    def test_invalid_choice(self):
        serializer = PropertySearchSerializer(data={'property_type': 'invalid'})
        assert not serializer.is_valid()

    def test_valid_bedrooms(self):
        serializer = PropertySearchSerializer(data={'bedrooms': '3'})
        assert serializer.is_valid(), serializer.errors

    def test_min_price_non_negative(self):
        serializer = PropertySearchSerializer(data={'min_price': -1})
        assert not serializer.is_valid()

    def test_page_size_capped_at_50(self):
        serializer = PropertySearchSerializer(data={'page_size': 100})
        assert not serializer.is_valid()
        assert 'page_size' in serializer.errors

    def test_location_stripped(self, db):
        serializer = PropertySearchSerializer(data={'location': '  Lekki  '})
        assert serializer.is_valid()
        assert serializer.validated_data.get('location') == 'Lekki'


# =====================================================================
# VIEW / API TESTS
# =====================================================================

class TestPropertySearchView:
    URL = '/api/v1/properties/search/'

    def test_empty_search_returns_no_results(self, db):
        client = APIClient()
        response = client.get(self.URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0
        assert response.data['results'] == []

    def test_search_returns_available_properties(self, db):
        PropertyFactory.create()
        PropertyFactory.create({'title': 'Second Property'})
        client = APIClient()
        response = client.get(self.URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_search_excludes_unavailable(self, db):
        PropertyFactory.create()
        PropertyFactory.create({'status': 'sold'})
        client = APIClient()
        response = client.get(self.URL)
        assert response.data['count'] == 1

    def test_filter_by_location(self, db):
        PropertyFactory.create({'city': 'Lekki', 'area': 'Phase 1'})
        PropertyFactory.create({'city': 'Abuja', 'area': 'Central'})
        client = APIClient()
        response = client.get(self.URL, {'location': 'Lekki'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_filter_by_property_type(self, db):
        PropertyFactory.create()
        PropertyFactory.create({'property_type': 'bungalow'})
        client = APIClient()
        response = client.get(self.URL, {'property_type': 'flat'})
        assert response.data['count'] == 1

    def test_filter_by_price_range(self, db):
        PropertyFactory.create({'price': 50_000_000})
        PropertyFactory.create({'price': 200_000_000})
        client = APIClient()
        response = client.get(self.URL, {'min_price': 100_000_000, 'max_price': 300_000_000})
        assert response.data['count'] == 1

    def test_filter_by_bedrooms(self, db):
        PropertyFactory.create({'bedrooms': 3})
        PropertyFactory.create({'bedrooms': 2})
        client = APIClient()
        response = client.get(self.URL, {'bedrooms': '3'})
        assert response.data['count'] == 1

    def test_filter_by_bedrooms_5_plus(self, db):
        PropertyFactory.create({'bedrooms': 3})
        PropertyFactory.create({'bedrooms': 6})
        client = APIClient()
        response = client.get(self.URL, {'bedrooms': '5'})
        assert response.data['count'] == 1

    def test_pagination_default(self, db):
        for i in range(15):
            PropertyFactory.create({'title': f'Property {i}'})
        client = APIClient()
        response = client.get(self.URL)
        assert len(response.data['results']) == 12

    def test_pagination_custom_page_size(self, db):
        for i in range(15):
            PropertyFactory.create({'title': f'Property {i}'})
        client = APIClient()
        response = client.get(self.URL, {'page_size': 5})
        assert len(response.data['results']) == 5

    def test_featured_first_ordering(self, db):
        a = PropertyFactory.create({'is_featured': False})
        b = PropertyFactory.create({'is_featured': True})
        client = APIClient()
        response = client.get(self.URL)
        assert response.data['results'][0]['id'] == str(b.id)

    def test_invalid_property_type_returns_error(self, db):
        client = APIClient()
        response = client.get(self.URL, {'property_type': 'invalid_type'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestPropertyDetailView:
    def test_get_property(self, db):
        prop = PropertyFactory.create()
        client = APIClient()
        response = client.get(f'/api/v1/properties/{prop.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Luxury 3-Bedroom Flat'

    def test_not_found(self, db):
        client = APIClient()
        response = client.get(f'/api/v1/properties/{uuid.uuid4()}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['success'] is False

    def test_excludes_unavailable(self, db):
        prop = PropertyFactory.create({'status': 'sold'})
        client = APIClient()
        response = client.get(f'/api/v1/properties/{prop.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_includes_images(self, db):
        prop = PropertyFactory.create()
        PropertyImageFactory.create(prop)
        PropertyImageFactory.create(prop, {'is_primary': True})
        client = APIClient()
        response = client.get(f'/api/v1/properties/{prop.id}/')
        assert len(response.data['images']) == 2
