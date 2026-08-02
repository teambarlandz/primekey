from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import ConciergeLeadSerializer, NDPRErasureRequestSerializer
from .services import LeadScoringService, NDPRErasureService


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class SubmitConciergeLeadView(APIView):
    """
    Public Endpoint: POST /api/crm/submit-concierge/
    Handles incoming concierge property sourcing requests and calculates lead scores.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # We pass context={'request': request} so the serializer can read IP & User-Agent for ConsentLog
        serializer = ConciergeLeadSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            lead = serializer.save()

            # 🔥 Calculate priority score and tier instantly upon lead creation
            score_obj = LeadScoringService.if_needed_score_lead(lead)

            return Response(
                {
                    "success": True,
                    "message": "Concierge lead registered successfully.",
                    "data": {
                        "id": str(lead.id),
                        "status": lead.status,
                        "priority_score": score_obj.get("score"),
                        "tier": score_obj.get("tier"),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        # DRF automatically structures validation errors into a dict (e.g. {'phone': ['Invalid...']})
        return Response(
            {
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class NDPRErasureView(APIView):
    """
    Public Endpoint: POST /api/crm/ndpr/request-erasure/
    Allows users to exercise their NDPR statutory right to data erasure.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = NDPRErasureRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Extract Client IP and User Agent for audit logging
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip_address = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = NDPRErasureService.process_erasure_request(
            identifier=serializer.validated_data['identifier'],
            ip_address=ip_address,
            user_agent=user_agent
        )

        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_404_NOT_FOUND)
