from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Property
from .serializers import PropertySearchSerializer, PropertySerializer


class PropertySearchView(APIView):
    """
    GET /api/v1/properties/search/
    
    Query Parameters:
    - location: str (searches city, area, address)
    - property_type: str (enum from Property.PROPERTY_TYPE_CHOICES)
    - min_price: int (minimum price in NGN)
    - max_price: int (maximum price in NGN)
    - bedrooms: str (number or '5' for 5+)
    - page: int (page number)
    - page_size: int (results per page, max 50)
    """
    
    def get(self, request):
        # Validate query parameters
        query_serializer = PropertySearchSerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data
        
        # Build queryset
        queryset = Property.objects.filter(
            status='available'
        ).select_related().prefetch_related('images')
        
        # Location filter (searches city, area, address)
        if params.get('location'):
            location = params['location'].strip()
            queryset = queryset.filter(
                Q(city__icontains=location) |
                Q(area__icontains=location) |
                Q(address__icontains=location) |
                Q(state__icontains=location)
            )
        
        # Property type filter
        if params.get('property_type') and params['property_type'] != 'any':
            queryset = queryset.filter(property_type=params['property_type'])
        
        # Price range filter
        if params.get('min_price') is not None:
            queryset = queryset.filter(price__gte=params['min_price'])
        if params.get('max_price') is not None:
            queryset = queryset.filter(price__lte=params['max_price'])
        
        # Bedrooms filter
        bedrooms = params.get('bedrooms', 'any')
        if bedrooms != 'any':
            if bedrooms == '5':
                queryset = queryset.filter(bedrooms__gte=5)
            else:
                queryset = queryset.filter(bedrooms=int(bedrooms))
        
        # Ordering
        queryset = queryset.order_by('-is_featured', '-created_at')
        
        # Pagination
        page = int(params.get('page', 1))
        page_size = min(int(params.get('page_size', 20)), 50)
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize
        serializer = PropertySerializer(page_obj.object_list, many=True)
        
        return Response({
            "count": paginator.count,
            "next": page_obj.next_page_number() if page_obj.has_next() else None,
            "previous": page_obj.previous_page_number() if page_obj.has_previous() else None,
            "results": serializer.data,
        })


class PropertyDetailView(APIView):
    """
    GET /api/v1/properties/<uuid:pk>/
    Returns full property details with images.
    """
    
    def get(self, request, pk):
        try:
            property_obj = Property.objects.prefetch_related('images').get(pk=pk, status='available')
        except Property.DoesNotExist:
            return Response(
                {"success": False, "message": "Property not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PropertySerializer(property_obj)
        return Response(serializer.data)