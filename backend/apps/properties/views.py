from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from .serializers import PropertyListSerializer, PropertyDetailSerializer
from .services import SearchService
from .models import Property


class PropertyPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class PropertySearchView(APIView):
    """
    Public Endpoint: GET /api/search/
    Returns filtered and paginated property listings.
    """
    permission_classes = [AllowAny]
    pagination_class = PropertyPagination

    def get(self, request, *args, **kwargs):
        queryset = SearchService.filter_properties(request.query_params)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = PropertyListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = PropertyListSerializer(queryset, many=True)
        return Response({
            "success": True,
            "count": len(serializer.data),
            "results": serializer.data
        }, status=status.HTTP_200_OK)


class PropertyDetailView(APIView):
    """
    Public Endpoint: GET /api/properties/<uuid:pk>/
    Returns full details for a single property by UUID.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk=None, *args, **kwargs):
        try:
            prop = Property.objects.get(pk=pk, status='available')
        except (Property.DoesNotExist, ValueError):
            return Response({
                "success": False,
                "message": "Property listing not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PropertyDetailSerializer(prop)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
