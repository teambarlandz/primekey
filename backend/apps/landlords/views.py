from django.utils import timezone
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from .access import can_access_landlord, is_agent
from .serializers import (
    LandlordProfileSerializer,
    LandlordProfileDetailSerializer,
    PropertyIntakeSerializer,
    AppointmentSerializer,
    DocumentVaultSerializer,
    APPOINTMENT_TIME_SLOTS,
)
from apps.notifications.services import create_notification

OWNER_ALLOWED_STATUS_TRANSITIONS = {"pending": {"cancelled"}}


def _current_landlord(request):
    """The landlord profile owned by the authenticated user, or None."""
    try:
        return LandlordProfile.objects.get(phone=request.user.username)
    except (LandlordProfile.DoesNotExist, AttributeError):
        return None


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
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
        if not can_access_landlord(request.user, profile):
            return Response(
                {"success": False, "message": "You can only access your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Owner or agent: id_number is NDPR-sensitive and only shown here.
        serializer = LandlordProfileDetailSerializer(profile)
        return Response(serializer.data)


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class PropertyIntakeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        landlord = _current_landlord(request)
        if landlord is None:
            return Response(
                {"success": False, "message": "No landlord profile found for this account."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # landlord is server-derived; client-supplied value is ignored.
        serializer = PropertyIntakeSerializer(data=request.data)
        if serializer.is_valid():
            intake = serializer.save(landlord=landlord)
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
        try:
            landlord = LandlordProfile.objects.get(pk=landlord_pk)
        except LandlordProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Landlord not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not can_access_landlord(request.user, landlord):
            return Response(
                {"success": False, "message": "You can only access your own listings."},
                status=status.HTTP_403_FORBIDDEN,
            )
        intakes = PropertyIntake.objects.filter(landlord=landlord)
        serializer = PropertyIntakeSerializer(intakes, many=True)
        return Response({"success": True, "data": serializer.data})


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class AppointmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        landlord = _current_landlord(request)
        if landlord is None:
            return Response(
                {"success": False, "message": "No landlord profile found for this account."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # landlord is server-derived; client-supplied value is ignored.
        serializer = AppointmentSerializer(data=request.data, context={'_server_landlord': landlord})
        if serializer.is_valid():
            appointment = serializer.save(landlord=landlord)
            return Response(
                {"success": True, "data": AppointmentSerializer(appointment).data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, landlord_pk):
        try:
            landlord = LandlordProfile.objects.get(pk=landlord_pk)
        except LandlordProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Landlord not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not can_access_landlord(request.user, landlord):
            return Response(
                {"success": False, "message": "You can only access your own appointments."},
                status=status.HTTP_403_FORBIDDEN,
            )
        appointments = Appointment.objects.filter(landlord=landlord)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({"success": True, "data": serializer.data})


@method_decorator(ratelimit(key='ip', rate='10/m', method='PATCH'), name='patch')
class AppointmentUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "message": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not can_access_landlord(request.user, appointment.landlord):
            return Response(
                {"success": False, "message": "You can only update your own appointments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        agent = is_agent(request.user)

        allowed_fields = {"status", "preferred_date", "time_slot"}
        provided = set(request.data.keys())
        if not provided.issubset(allowed_fields):
            return Response(
                {"success": False, "errors": {"detail": "Only status, preferred_date and time_slot can be updated."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        status_value = request.data.get("status")
        if status_value is not None and status_value not in {"pending", "confirmed", "completed", "cancelled"}:
            return Response(
                {"success": False, "errors": {"status": ["Invalid appointment status."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Owners may only cancel a pending appointment; only agents may
        # confirm/complete/reschedule on behalf of the operations team.
        if status_value and not agent:
            allowed_next = OWNER_ALLOWED_STATUS_TRANSITIONS.get(appointment.status, set())
            if status_value not in allowed_next:
                return Response(
                    {"success": False, "errors": {"status": ["You cannot change the appointment to this status."]}},
                    status=status.HTTP_403_FORBIDDEN,
                )

        preferred_date = request.data.get("preferred_date", appointment.preferred_date)
        time_slot = request.data.get("time_slot", appointment.time_slot)

        if str(preferred_date) < timezone.localdate().isoformat():
            return Response(
                {"success": False, "errors": {"preferred_date": ["Preferred date cannot be in the past."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "time_slot" in request.data and time_slot not in APPOINTMENT_TIME_SLOTS:
            return Response(
                {"success": False, "errors": {"time_slot": ["Invalid time slot."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reschedule = "preferred_date" in request.data or "time_slot" in request.data
        if reschedule:
            if not agent:
                return Response(
                    {"success": False, "errors": {"detail": "Only our team can reschedule appointments."}},
                    status=status.HTTP_403_FORBIDDEN,
                )
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

        if status_value:
            appointment.status = status_value

        appointment.save()
        create_notification(
            "agent",
            appointment.landlord_id,
            "Appointment updated by landlord",
            f"{appointment.landlord.full_name} {'cancelled' if status_value == 'cancelled' else 'rescheduled'} their consultation ({appointment.preferred_date} at {appointment.time_slot}).",
        )
        return Response(
            {"success": True, "data": AppointmentSerializer(appointment).data},
            status=status.HTTP_200_OK,
        )


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        landlord_pk = data.get('landlord_id')
        if not landlord_pk:
            return Response(
                {"success": False, "errors": {"landlord_id": ["Landlord ID is required."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            landlord = LandlordProfile.objects.get(pk=landlord_pk)
        except LandlordProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Landlord not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Ownership gate: only the landlord themselves (or an agent) may
        # upload documents to a profile.
        if not can_access_landlord(request.user, landlord):
            return Response(
                {"success": False, "message": "You can only upload documents for your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        intake_pk = data.get('intake_id')
        intake = None
        if intake_pk:
            try:
                intake = PropertyIntake.objects.get(pk=intake_pk, landlord=landlord)
            except PropertyIntake.DoesNotExist:
                return Response(
                    {"success": False, "errors": {"intake_id": ["Intake not found for this landlord."]}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = DocumentVaultSerializer(
            data=data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        document = serializer.save(landlord=landlord, intake=intake)

        create_notification(
            "agent",
            landlord.id,
            "New document uploaded",
            f"{landlord.full_name} uploaded a {document.get_doc_type_display()} for review.",
        )

        return Response(
            {
                "success": True,
                "message": "Document uploaded for review.",
                "data": DocumentVaultSerializer(document, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, landlord_pk):
        try:
            landlord = LandlordProfile.objects.get(pk=landlord_pk)
        except LandlordProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Landlord not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not can_access_landlord(request.user, landlord):
            return Response(
                {"success": False, "message": "You can only access your own documents."},
                status=status.HTTP_403_FORBIDDEN,
            )
        documents = DocumentVault.objects.filter(landlord=landlord)
        serializer = DocumentVaultSerializer(documents, many=True, context={'request': request})
        return Response({"success": True, "data": serializer.data})


class DocumentDownloadView(APIView):
    """
    GET /api/v1/landlords/documents/<pk>/download/
    Stream a protected document. Owner or agent only. The file lives outside
    MEDIA_ROOT so it is never reachable via any public URL.
    """

    permission_classes = [IsAuthenticated]

    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET'), name='get')
    def get(self, request, pk):
        try:
            document = DocumentVault.objects.select_related('landlord').get(pk=pk)
        except DocumentVault.DoesNotExist:
            return Response(
                {"success": False, "message": "Document not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not can_access_landlord(request.user, document.landlord):
            return Response(
                {"success": False, "message": "You can only download your own documents."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not document.file:
            return Response(
                {"success": False, "message": "Document file is missing."},
                status=status.HTTP_404_NOT_FOUND,
            )
        from django.http import FileResponse

        response = FileResponse(
            document.file.open('rb'),
            content_type='application/octet-stream',
        )
        response['Content-Disposition'] = (
            f'attachment; filename="landlord-document-{document.id}.{document.file.name.rsplit(".", 1)[-1]}"'
        )
        return response
