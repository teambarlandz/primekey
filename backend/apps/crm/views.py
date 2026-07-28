from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import ConciergeLeadSerializer


class SubmitConciergeLeadView(APIView):
    """
    Public Endpoint: POST /api/crm/submit-concierge/
    Handles incoming concierge property sourcing requests.
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

            return Response(
                {
                    "success": True,
                    "message": "Concierge lead registered successfully.",
                    "data": {
                        "id": str(lead.id),
                        "status": lead.status,
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
