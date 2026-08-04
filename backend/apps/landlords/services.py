from django.utils import timezone
from .models import LandlordProfile, PropertyIntake, Appointment, DocumentVault
from .serializers import APPOINTMENT_TIME_SLOTS


def validate_appointment_update(appointment, data):
    """
    Validate appointment update fields. Returns (is_valid, errors_dict).
    """
    allowed_fields = {"status", "preferred_date", "time_slot"}
    provided = set(data.keys())
    if not provided.issubset(allowed_fields):
        return False, {"detail": "Only status, preferred_date and time_slot can be updated."}

    status_value = data.get("status")
    if status_value is not None and status_value not in {"pending", "confirmed", "cancelled"}:
        return False, {"status": ["Invalid appointment status."]}

    preferred_date = data.get("preferred_date", appointment.preferred_date)
    time_slot = data.get("time_slot", appointment.time_slot)

    if str(preferred_date) < timezone.localdate().isoformat():
        return False, {"preferred_date": ["Preferred date cannot be in the past."]}

    if "time_slot" in data and time_slot not in APPOINTMENT_TIME_SLOTS:
        return False, {"time_slot": ["Invalid time slot."]}

    reschedule = "preferred_date" in data or "time_slot" in data
    if reschedule:
        conflict = Appointment.objects.filter(
            landlord=appointment.landlord,
            preferred_date=preferred_date,
            time_slot=time_slot,
        ).exclude(status='cancelled').exclude(pk=appointment.pk).exists()
        if conflict:
            return False, {"time_slot": ["This time slot is already booked for the selected date."]}

    return True, None


def apply_appointment_update(appointment, data):
    """
    Apply validated update fields to an appointment instance.
    """
    preferred_date = data.get("preferred_date", appointment.preferred_date)
    time_slot = data.get("time_slot", appointment.time_slot)
    status_value = data.get("status")

    reschedule = "preferred_date" in data or "time_slot" in data
    if reschedule:
        appointment.preferred_date = preferred_date
        appointment.time_slot = time_slot

    if status_value:
        appointment.status = status_value

    appointment.save()
    return appointment


def get_landlord_or_404(landlord_pk):
    """
    Return (landlord, None) or (None, error_response).
    """
    try:
        return LandlordProfile.objects.get(pk=landlord_pk), None
    except LandlordProfile.DoesNotExist:
        from rest_framework.response import Response
        from rest_framework import status as http_status
        return None, Response(
            {"success": False, "message": "Landlord not found"},
            status=http_status.HTTP_404_NOT_FOUND,
        )


def validate_document_upload(data):
    """
    Validate document upload data. Returns (landlord, intake, None) or (None, None, error_response).
    """
    from rest_framework.response import Response
    from rest_framework import status as http_status

    landlord_pk = data.get('landlord_id')
    if not landlord_pk:
        return None, None, Response(
            {"success": False, "errors": {"landlord_id": ["Landlord ID is required."]}},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    landlord, error = get_landlord_or_404(landlord_pk)
    if error:
        return None, None, error

    intake_pk = data.get('intake_id')
    intake = None
    if intake_pk:
        try:
            intake = PropertyIntake.objects.get(pk=intake_pk, landlord=landlord)
        except PropertyIntake.DoesNotExist:
            return None, None, Response(
                {"success": False, "errors": {"intake_id": ["Intake not found for this landlord."]}},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

    return landlord, intake, None
