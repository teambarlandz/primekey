from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django.db.models import Q
from django.utils import timezone
from .serializers import ConciergeLeadSerializer, ConsentLogSerializer
from .models import ConciergeLead, ConsentLog
from .services import LeadScoringService, SLAAlertService


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=True), name='post')
class SubmitConciergeLeadView(APIView):
    """
    Public Endpoint: POST /api/v1/crm/submit-concierge/
    Handles incoming concierge property sourcing requests.
    Rate limited: 10 requests per minute per IP.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ConciergeLeadSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            lead = serializer.save()
            
            # Calculate initial lead score
            scoring_service = LeadScoringService()
            scoring_service.calculate_score(lead)

            return Response(
                {
                    "success": True,
                    "message": "Concierge lead registered successfully.",
                    "data": {
                        "id": str(lead.id),
                        "status": lead.status,
                        "lead_score": lead.lead_score,
                        "sla_deadline": lead.sla_deadline,
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


class ConciergeLeadPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConciergeLeadListView(APIView):
    """
    Authenticated Endpoint: GET /api/v1/crm/leads/
    List all concierge leads with filtering and pagination.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = ConciergeLeadPagination

    def get(self, request):
        queryset = ConciergeLead.objects.select_related(
            'assigned_agent', 'score_breakdown'
        ).prefetch_related('sla_alerts', 'consent_logs').all()

        # Filtering
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search) |
                Q(preferred_location__icontains=search)
            )

        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        serializer = ConciergeLeadSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ConciergeLeadDetailView(APIView):
    """
    Authenticated Endpoint: GET/PATCH /api/v1/crm/leads/<uuid:pk>/
    Retrieve or update a specific lead.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            lead = ConciergeLead.objects.select_related(
                'assigned_agent', 'score_breakdown'
            ).prefetch_related('sla_alerts', 'consent_logs').get(pk=pk)
        except ConciergeLead.DoesNotExist:
            return Response(
                {"success": False, "message": "Lead not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ConciergeLeadSerializer(lead)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            lead = ConciergeLead.objects.get(pk=pk)
        except ConciergeLead.DoesNotExist:
            return Response(
                {"success": False, "message": "Lead not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only allow certain fields to be updated
        allowed_fields = ['status', 'assigned_agent', 'lead_score']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = ConciergeLeadSerializer(lead, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            {"success": False, "message": "Validation failed", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class RecalculateLeadScoreView(APIView):
    """
    Authenticated Endpoint: POST /api/v1/crm/leads/<uuid:pk>/recalculate-score/
    Manually trigger lead score recalculation.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = ConciergeLead.objects.get(pk=pk)
        except ConciergeLead.DoesNotExist:
            return Response(
                {"success": False, "message": "Lead not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        scoring_service = LeadScoringService()
        score_obj = scoring_service.calculate_score(lead)

        return Response({
            "success": True,
            "message": "Lead score recalculated",
            "data": {
                "lead_id": str(lead.id),
                "total_score": score_obj.total_score,
                "breakdown": {
                    "budget_match": score_obj.budget_match_score,
                    "location_match": score_obj.location_match_score,
                    "property_type_match": score_obj.property_type_match_score,
                    "bedrooms_match": score_obj.bedrooms_match_score,
                    "completeness": score_obj.completeness_score,
                    "urgency": score_obj.urgency_score,
                }
            }
        })


class SLAAlertListView(APIView):
    """
    Authenticated Endpoint: GET /api/v1/crm/sla-alerts/
    List unacknowledged SLA alerts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = SLAAlertService()
        alerts = service.get_unacknowledged_alerts()
        
        # Simple serialization
        data = []
        for alert in alerts:
            data.append({
                'id': str(alert.id),
                'lead_id': str(alert.lead_id),
                'lead_name': alert.lead.full_name,
                'lead_phone': alert.lead.phone,
                'severity': alert.severity,
                'message': alert.message,
                'created_at': alert.created_at,
            })
        
        return Response({"success": True, "data": data})


class SLAAlertAcknowledgeView(APIView):
    """
    Authenticated Endpoint: POST /api/v1/crm/sla-alerts/<uuid:pk>/acknowledge/
    Acknowledge an SLA alert.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        service = SLAAlertService()
        success = service.acknowledge_alert(pk, request.user)
        
        if success:
            return Response({"success": True, "message": "Alert acknowledged"})
        
        return Response(
            {"success": False, "message": "Alert not found or already acknowledged"},
            status=status.HTTP_404_NOT_FOUND
        )


class ConsentLogListView(APIView):
    """
    Authenticated Endpoint: GET /api/v1/crm/leads/<uuid:lead_pk>/consent-logs/
    Retrieve consent logs for a specific lead.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, lead_pk):
        try:
            lead = ConciergeLead.objects.get(pk=lead_pk)
        except ConciergeLead.DoesNotExist:
            return Response(
                {"success": False, "message": "Lead not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        logs = lead.consent_logs.all().order_by('-created_at')
        serializer = ConsentLogSerializer(logs, many=True)
        return Response({"success": True, "data": serializer.data})