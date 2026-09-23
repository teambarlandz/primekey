from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.landlords.models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from apps.crm.models import ConciergeLead
from apps.tenancy.models import Unit, Lease, Tenant
from apps.notifications.services import create_notification
from .permissions import IsAgent, IsManager
from .serializers import (
    DashboardLandlordSerializer,
    DashboardIntakeSerializer,
    DashboardAppointmentSerializer,
    DashboardLeadSerializer,
    DashboardSummarySerializer,
    DashboardDocumentSerializer,
    DocumentReviewSerializer,
    LandlordVerificationUpdateSerializer,
    IntakeStatusUpdateSerializer,
    AppointmentUpdateSerializer,
)

AGENT_PERMISSIONS = [IsAuthenticated, IsAgent]
MANAGER_PERMISSIONS = [IsAuthenticated, IsManager]


class DashboardSummaryView(APIView):
    permission_classes = AGENT_PERMISSIONS

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
            "leads_hot": ConciergeLead.objects.filter(score_breakdown__tier='HOT').count(),
            "leads_warm": ConciergeLead.objects.filter(score_breakdown__tier='WARM').count(),
            "leads_cold": ConciergeLead.objects.filter(score_breakdown__tier='COLD').count(),
            "leads_sla_breached": ConciergeLead.objects.filter(sla_breached_at__isnull=False).count(),
            "total_units": Unit.objects.count(),
            "occupied_units": Unit.objects.filter(status='occupied').count(),
            "active_leases": Lease.objects.filter(status='active').count(),
            "total_tenants": Tenant.objects.count(),
            "total_rent_revenue": Lease.objects.filter(status='active').aggregate(total=models.Sum('rent_amount'))['total'] or 0,
        }

        serializer = DashboardSummarySerializer(summary)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardLandlordListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        landlords = LandlordProfile.objects.select_related().prefetch_related('properties', 'appointments')
        serializer = DashboardLandlordSerializer(landlords, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardLeadListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        leads = ConciergeLead.objects.select_related('score_breakdown', 'assigned_agent').order_by(
            '-score_breakdown__total_score', '-created_at'
        )
        serializer = DashboardLeadSerializer(leads, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardIntakeListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        intakes = PropertyIntake.objects.select_related('landlord')
        serializer = DashboardIntakeSerializer(intakes, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DashboardAppointmentListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        appointments = Appointment.objects.select_related('landlord')
        serializer = DashboardAppointmentSerializer(appointments, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class LandlordVerificationUpdateView(APIView):
    permission_classes = MANAGER_PERMISSIONS

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
    permission_classes = MANAGER_PERMISSIONS

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
    permission_classes = AGENT_PERMISSIONS

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


class DashboardDocumentListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        documents = DocumentVault.objects.select_related('landlord', 'intake').order_by(
            '-uploaded_at'
        )
        serializer = DashboardDocumentSerializer(documents, many=True, context={'request': request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class DocumentReviewView(APIView):
    permission_classes = MANAGER_PERMISSIONS

    def patch(self, request, pk):
        try:
            document = DocumentVault.objects.select_related('landlord', 'intake').get(pk=pk)
        except DocumentVault.DoesNotExist:
            return Response(
                {"success": False, "message": "Document not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DocumentReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attrs = serializer.validated_data
        document.review_status = attrs["review_status"]
        document.review_notes = attrs.get("review_notes", document.review_notes)
        document.reviewed_at = timezone.now()
        document.save(update_fields=["review_status", "review_notes", "reviewed_at"])

        if document.review_status == "approved":
            create_notification(
                "landlord",
                document.landlord_id,
                "Document approved",
                f"Your {document.get_doc_type_display()} has been approved.",
            )
        elif document.review_status == "rejected":
            notes = document.review_notes or "Please reach out to your manager for details."
            create_notification(
                "landlord",
                document.landlord_id,
                "Document needs attention",
                f"Your {document.get_doc_type_display()} was rejected. {notes}",
            )

        return Response(
            {"success": True, "data": DashboardDocumentSerializer(document, context={'request': request}).data},
            status=status.HTTP_200_OK,
        )


