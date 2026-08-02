from datetime import timedelta

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from apps.landlords.models import LandlordProfile, PropertyIntake, Appointment
from apps.crm.models import ConciergeLead
from apps.notifications.services import create_notification
from .serializers import (
    DashboardLandlordSerializer,
    DashboardIntakeSerializer,
    DashboardAppointmentSerializer,
    DashboardSummarySerializer,
    LandlordVerificationUpdateSerializer,
    IntakeStatusUpdateSerializer,
    AppointmentUpdateSerializer,
)


class DashboardSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        seven_days_ago = timezone.now() - timedelta(days=7)

        summary = {
            "total_landlords": LandlordProfile.objects.count(),
            "landlords_pending_verification": LandlordProfile.objects.filter(
                verification_status='pending'
            ).count(),
            "total_intakes": PropertyIntake.objects.count(),
            "intakes_submitted": PropertyIntake.objects.filter(status='submitted').count(),
            "intakes_approved": PropertyIntake.objects.filter(status='approved').count(),
            "intakes_rejected": PropertyIntake.objects.filter(status='rejected').count(),
            "total_appointments": Appointment.objects.count(),
            "appointments_pending": Appointment.objects.filter(status='pending').count(),
            "appointments_confirmed": Appointment.objects.filter(status='confirmed').count(),
            "total_concierge_leads": ConciergeLead.objects.count(),
            "leads_new_7d": ConciergeLead.objects.filter(created_at__gte=seven_days_ago).count(),
        }

        serializer = DashboardSummarySerializer(summary)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardLandlordListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        landlords = LandlordProfile.objects.select_related().prefetch_related('properties', 'appointments')
        serializer = DashboardLandlordSerializer(landlords, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardIntakeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        intakes = PropertyIntake.objects.select_related('landlord')
        serializer = DashboardIntakeSerializer(intakes, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardAppointmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        appointments = Appointment.objects.select_related('landlord')
        serializer = DashboardAppointmentSerializer(appointments, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class LandlordVerificationUpdateView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            landlord = LandlordProfile.objects.get(pk=pk)
        except LandlordProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Landlord not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = LandlordVerificationUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        landlord.verification_status = serializer.validated_data["verification_status"]
        landlord.save(update_fields=["verification_status", "updated_at"])
        if landlord.verification_status == "approved":
            create_notification(
                "landlord",
                landlord.id,
                "Identity verified",
                "Your landlord registration has been approved. You can now list properties on Primekey Homes.",
            )
        elif landlord.verification_status == "rejected":
            create_notification(
                "landlord",
                landlord.id,
                "Identity verification rejected",
                "We could not verify your ID. Please contact our team to resolve this.",
            )
        return Response(
            {"success": True, "data": DashboardLandlordSerializer(landlord).data},
            status=status.HTTP_200_OK,
        )


class IntakeStatusUpdateView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            intake = PropertyIntake.objects.select_related('landlord').get(pk=pk)
        except PropertyIntake.DoesNotExist:
            return Response(
                {"success": False, "message": "Property intake not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = IntakeStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        intake.status = serializer.validated_data["status"]
        intake.save(update_fields=["status", "updated_at"])
        if intake.status == "approved":
            create_notification(
                "landlord",
                intake.landlord_id,
                "Listing approved",
                f"Your property '{intake.title}' has been approved and is being prepared for publishing.",
            )
        elif intake.status == "rejected":
            create_notification(
                "landlord",
                intake.landlord_id,
                "Listing needs attention",
                f"Your property '{intake.title}' was not approved. Please review the details or contact your manager.",
            )
        return Response(
            {"success": True, "data": DashboardIntakeSerializer(intake).data},
            status=status.HTTP_200_OK,
        )


class AppointmentUpdateView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.select_related('landlord').get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "message": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AppointmentUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        attrs = serializer.validated_data

        reschedule = attrs.get("preferred_date") or attrs.get("time_slot")
        if reschedule:
            preferred_date = attrs.get("preferred_date", appointment.preferred_date)
            time_slot = attrs.get("time_slot", appointment.time_slot)
            conflict = Appointment.objects.filter(
                landlord=appointment.landlord,
                preferred_date=preferred_date,
                time_slot=time_slot,
            ).exclude(status='cancelled').exclude(pk=appointment.pk).exists()
            if conflict:
                return Response(
                    {"success": False, "errors": {"time_slot": ["This time slot is already booked for the selected date."]}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            appointment.preferred_date = preferred_date
            appointment.time_slot = time_slot

        if attrs.get("status"):
            appointment.status = attrs["status"]

        appointment.save()
        if appointment.status == "confirmed":
            create_notification(
                "landlord",
                appointment.landlord_id,
                "Appointment confirmed",
                f"Your consultation on {appointment.preferred_date} at {appointment.time_slot} has been confirmed.",
            )
        elif appointment.status == "cancelled":
            create_notification(
                "landlord",
                appointment.landlord_id,
                "Appointment cancelled",
                f"Your consultation on {appointment.preferred_date} at {appointment.time_slot} was cancelled by our team.",
            )
        elif reschedule:
            create_notification(
                "landlord",
                appointment.landlord_id,
                "Appointment rescheduled",
                f"Your consultation has been moved to {appointment.preferred_date} at {appointment.time_slot}.",
            )
        return Response(
            {"success": True, "data": DashboardAppointmentSerializer(appointment).data},
            status=status.HTTP_200_OK,
        )
