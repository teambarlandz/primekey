from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import LandlordProfile, PropertyIntake, Appointment
from .serializers import (
    LandlordProfileSerializer,
    PropertyIntakeSerializer,
    AppointmentSerializer,
)


class LandlordRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LandlordProfileSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Registration submitted for verification.",
                    "data": LandlordProfileSerializer(profile).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "message": "Validation failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LandlordProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            profile = LandlordProfile.objects.get(pk=pk)
        except LandlordProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = LandlordProfileSerializer(profile)
        return Response(serializer.data)


class PropertyIntakeCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PropertyIntakeSerializer(data=request.data)
        if serializer.is_valid():
            intake = serializer.save()
            return Response(
                {"success": True, "data": PropertyIntakeSerializer(intake).data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class PropertyIntakeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, landlord_pk):
        intakes = PropertyIntake.objects.filter(landlord_id=landlord_pk)
        serializer = PropertyIntakeSerializer(intakes, many=True)
        return Response({"success": True, "data": serializer.data})


class AppointmentCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save()
            return Response(
                {"success": True, "data": AppointmentSerializer(appointment).data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
