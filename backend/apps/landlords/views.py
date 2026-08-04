from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from .serializers import (
    LandlordProfileSerializer,
    PropertyIntakeSerializer,
    AppointmentSerializer,
    DocumentVaultSerializer,
)
from .services import (
    validate_appointment_update,
    apply_appointment_update,
    get_landlord_or_404,
    validate_document_upload,
)
from apps.notifications.services import create_notification


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
        landlord, error = get_landlord_or_404(pk)
        if error:
            return error
        serializer = LandlordProfileSerializer(landlord)
        return Response(serializer.data)


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
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


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
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


class AppointmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, landlord_pk):
        landlord, error = get_landlord_or_404(landlord_pk)
        if error:
            return error
        appointments = Appointment.objects.filter(landlord_id=landlord_pk)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({"success": True, "data": serializer.data})


@method_decorator(ratelimit(key='ip', rate='10/m', method='PATCH'), name='patch')
class AppointmentUpdateView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "message": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        is_valid, errors = validate_appointment_update(appointment, request.data)
        if not is_valid:
            return Response(
                {"success": False, "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment = apply_appointment_update(appointment, request.data)

        status_value = request.data.get("status")
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
    permission_classes = [AllowAny]

    def post(self, request):
        landlord, intake, error = validate_document_upload(request.data)
        if error:
            return error

        serializer = DocumentVaultSerializer(
            data=request.data,
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
    permission_classes = [AllowAny]

    def get(self, request, landlord_pk):
        landlord, error = get_landlord_or_404(landlord_pk)
        if error:
            return error
        documents = DocumentVault.objects.filter(landlord_id=landlord_pk)
        serializer = DocumentVaultSerializer(documents, many=True, context={'request': request})
        return Response({"success": True, "data": serializer.data})
