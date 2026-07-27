from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ConciergeLead
from .serializers import ConciergeLeadSerializer


class SubmitConciergeLeadView(generics.CreateAPIView):
    """
    API View to handle 2-Week Concierge lead registration from frontend.
    Endpoint: POST /api/submit-concierge

    Accepts lead details and NDPR consent status, creates the lead record,
    and logs immutable consent audit trail.
    """

    queryset = ConciergeLead.objects.all()
    serializer_class = ConciergeLeadSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Your concierge request has been successfully submitted.",
                "data": {
                    "lead_id": str(lead.id),
                    "full_name": lead.full_name,
                    "status": lead.status,
                    "created_at": lead.created_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )
