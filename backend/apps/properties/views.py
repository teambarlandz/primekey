from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from .serializers import PropertyListSerializer, PropertyDetailSerializer
from .services import SearchService
from .models import Property
from apps.crm.serializers import PropertyInquirySerializer
from apps.crm.services import LeadScoringService
from apps.notifications.services import create_notification


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


PROPERTY_TYPE_MAP = {
    "self_contain": "flat_apartment",
    "room_and_parlour": "flat_apartment",
    "single_room": "flat_apartment",
    "bq": "flat_apartment",
    "short_let": "flat_apartment",
    "flat": "flat_apartment",
    "maisonette": "house_duplex",
    "bungalow": "house_duplex",
    "terrace_duplex": "house_duplex",
    "semi_detached_duplex": "house_duplex",
    "fully_detached_duplex": "house_duplex",
    "penthouse": "house_duplex",
    "mansion": "house_duplex",
    "land": "land",
    "commercial": "commercial",
}


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class PropertyInquirySubmitView(APIView):
    """
    Public Endpoint: POST /api/properties/properties/<uuid:pk>/inquiries/
    Creates a concierge lead tied to a specific listing from the detail page.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk=None, *args, **kwargs):
        try:
            prop = Property.objects.get(pk=pk, status='available')
        except (Property.DoesNotExist, ValueError):
            return Response({
                "success": False,
                "message": "Property listing not found."
            }, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['listing'] = str(prop.id)

        serializer = PropertyInquirySerializer(
            data=data,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.validated_data['preferred_location'] = f"{prop.area}, {prop.city}, {prop.state}"
            serializer.validated_data['property_type'] = PROPERTY_TYPE_MAP.get(prop.property_type, 'any')
            serializer.validated_data['budget_max'] = int(prop.price)
            serializer.validated_data['budget_min'] = 0
            serializer.validated_data['bedrooms'] = str(prop.bedrooms)

            lead = serializer.save()

            score_obj = LeadScoringService.if_needed_score_lead(lead)
            lead.start_sla_clock()

            create_notification(
                "agent",
                None,
                "New buyer inquiry",
                f"{lead.full_name} inquired about '{prop.title}' ({prop.area}, {prop.city}).",
            )

            return Response(
                {
                    "success": True,
                    "message": "Inquiry submitted successfully.",
                    "data": {
                        "id": str(lead.id),
                        "status": lead.status,
                        "priority_score": score_obj.get("score"),
                        "tier": score_obj.get("tier"),
                        "property_title": prop.title,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
