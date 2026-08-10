from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import JobOpening
from .serializers import JobOpeningSerializer


class JobOpeningListView(APIView):
    """
    Public Endpoint: GET /api/v1/careers/openings/
    Returns all active job openings for the careers page.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        queryset = JobOpening.objects.filter(is_active=True)
        serializer = JobOpeningSerializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "count": len(serializer.data),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
