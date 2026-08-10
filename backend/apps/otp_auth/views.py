import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from core.security import get_client_ip
from .models import OTPCode
from .serializers import SendOTPSerializer, VerifyOTPSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


def _phone_ip_key(group, request):
    """Rate-limit bucket per phone + client IP."""
    return f"{get_client_ip(request)}:{request.data.get('phone', 'unknown')}"


class SendOTPView(APIView):
    """
    POST /api/v1/auth/otp/send/
    Send a 6-digit OTP code to the provided phone number.
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_phone_ip_key, rate='5/m', method='POST'))
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "message": "Validation failed.", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']

        # Create OTP code
        otp = OTPCode.create_otp(
            phone=phone,
            purpose=purpose,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        # In production, send via SMS provider (Termii, Twilio, etc.)
        # For development, expose the code via dev_code (DEBUG only).
        logger.info(f"OTP sent to {phone} (purpose={purpose})")

        response_data = {
            "phone": phone,
            "purpose": purpose,
            "expires_in_minutes": 5,
        }
        # Only include the code in development
        if settings.DEBUG:
            response_data["dev_code"] = otp._plaintext_code

        return Response({
            "success": True,
            "message": "OTP sent successfully. Please check your phone.",
            "data": response_data,
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/v1/auth/otp/verify/
    Verify the OTP code and return JWT tokens if valid.
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_phone_ip_key, rate='10/m', method='POST'))
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "message": "Validation failed.", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        # Find the latest unused OTP for this phone/purpose
        try:
            otp = OTPCode.objects.filter(
                phone=phone,
                purpose=purpose,
                used=False
            ).latest('created_at')
        except OTPCode.DoesNotExist:
            return Response({
                "success": False,
                "message": "No valid OTP found. Please request a new code.",
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the code
        is_valid, message = otp.verify(code)
        if not is_valid:
            return Response({
                "success": False,
                "message": message,
            }, status=status.HTTP_400_BAD_REQUEST)

        if purpose == 'agent_login':
            # Agent login must map to an existing active AgentProfile
            from apps.dashboard.models import AgentProfile

            try:
                agent = AgentProfile.objects.get(phone=phone, is_active=True)
            except AgentProfile.DoesNotExist:
                return Response({
                    "success": False,
                    "message": "No active agent account found for this phone number.",
                }, status=status.HTTP_403_FORBIDDEN)

            user = agent.user
            user.is_active = True
            user.save(update_fields=['is_active'])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                "success": True,
                "message": "OTP verified successfully.",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": str(user.id),
                        "phone": phone,
                        "full_name": agent.full_name or user.username,
                        "role": agent.role,
                    }
                }
            }, status=status.HTTP_200_OK)

        # Get or create user
        user, created = User.objects.get_or_create(
            username=phone,
            defaults={'is_active': True}
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "success": True,
            "message": "OTP verified successfully.",
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": str(user.id),
                    "phone": user.username,
                    "is_new_user": created,
                }
            }
        }, status=status.HTTP_200_OK)