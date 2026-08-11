from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import JobApplication, JobOpening
from .serializers import (
    JobApplicationCreateSerializer,
    JobApplicationDetailSerializer,
    JobOpeningDetailSerializer,
    JobOpeningSerializer,
)


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


class JobOpeningDetailView(APIView):
    """
    Public Endpoint: GET /api/v1/careers/openings/<uuid>/
    Returns full details for a single job opening.
    """

    permission_classes = [AllowAny]

    def get(self, request, pk, *args, **kwargs):
        try:
            opening = JobOpening.objects.get(pk=pk, is_active=True)
        except JobOpening.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "detail": "Job opening not found or no longer available.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = JobOpeningDetailSerializer(opening)
        return Response(
            {
                "success": True,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class JobApplicationCreateView(APIView):
    """
    Public Endpoint: POST /api/v1/careers/applications/
    Submit a job application for a specific opening.

    Accepts multipart/form-data (file upload for resume).
    Rate-limited to prevent abuse. NDPR consent is required.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = JobApplicationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "detail": "Your application has been submitted successfully. "
                "We will review it and get back to you within one week.",
                "results": {
                    "id": str(serializer.instance.id),
                    "job_opening": str(serializer.instance.job_opening_id),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class JobApplicationListView(APIView):
    """
    Authenticated Endpoint: GET /api/v1/careers/openings/<uuid>/applications/
    List all applications for a specific job opening.
    Requires staff or manager/admin role.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, opening_pk, *args, **kwargs):
        user = request.user
        if not user.is_staff:
            profile = getattr(user, "agent_profile", None)
            if not profile or profile.role not in ("manager", "admin"):
                return Response(
                    {
                        "success": False,
                        "detail": "You do not have permission to view applications.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        try:
            opening = JobOpening.objects.get(pk=opening_pk)
        except JobOpening.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "detail": "Job opening not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        applications = JobApplication.objects.filter(job_opening=opening)
        serializer = JobApplicationDetailSerializer(applications, many=True)
        return Response(
            {
                "success": True,
                "count": len(serializer.data),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
