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

from core.security import get_client_ip, is_dev_client
from .models import OTPCode
from .serializers import SendOTPSerializer, VerifyOTPSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


def _email_ip_key(group, request):
    """Rate-limit bucket per email identifier + client IP."""
    ident = request.data.get('email') or 'unknown'
    return f"{get_client_ip(request)}:{ident}"


class SendOTPView(APIView):
    """
    POST /api/v1/auth/otp/send/
    Send a 6-digit OTP code to the user's email via Resend.
    Body: {email, purpose}
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_email_ip_key, rate='5/m', method='POST'))
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "message": "Validation failed.", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']

        # Create OTP code (stores digest only; plaintext in _plaintext_code)
        otp = OTPCode.create_otp(
            email=email,
            purpose=purpose,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        # Email is the only delivery channel
        from .services import send_otp_via_resend
        provider = "Resend"
        try:
            sent = send_otp_via_resend(email, otp._plaintext_code, purpose)
        except Exception as exc:
            logger.exception("OTP provider failed for %s: %s", email, exc)
            # In production, surface delivery failure so client can retry
            if not settings.DEBUG:
                return Response({
                    "success": False,
                    "message": "Failed to deliver OTP. Please try again in a moment.",
                }, status=status.HTTP_502_BAD_GATEWAY)
            # In DEBUG, still return success with dev_code so flow is testable
            sent = True

        if sent:
            logger.info("OTP sent via %s to %s (purpose=%s)", provider, email, purpose)
        elif not settings.DEBUG:
            # Provider is not configured. Returning 200 here would tell the user
            # "OTP sent" while nothing was ever delivered.
            logger.error("OTP not delivered to %s — %s is not configured", email, provider)
            return Response({
                "success": False,
                "message": "OTP delivery is temporarily unavailable. Please try again later.",
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        else:
            logger.info(
                "OTP created for %s (purpose=%s) — %s not configured, dev_code available",
                email, purpose, provider,
            )

        response_data = {
            "purpose": purpose,
            "email": email,
            "expires_in_minutes": 5,
        }
        # Only expose the plaintext code to loopback clients while DEBUG is
        # enabled. Never in production, even if DEBUG is accidentally on.
        if is_dev_client(request):
            response_data["dev_code"] = otp._plaintext_code

        return Response({
            "success": True,
            "message": "OTP sent successfully. Please check your email.",
            "data": response_data,
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/v1/auth/otp/verify/
    Verify the OTP code and return JWT tokens if valid.
    Body: {email, code, purpose}
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_email_ip_key, rate='10/m', method='POST'))
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "message": "Validation failed.", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        # Find the latest unused OTP for this email/purpose
        qs = OTPCode.objects.filter(email=email, purpose=purpose, used=False)
        try:
            otp = qs.latest('created_at')
        except OTPCode.DoesNotExist:
            return Response({
                "success": False,
                "message": "No valid OTP found. Please request a new code.",
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the code (binds to IP/UA recorded at send time)
        is_valid, message = otp.verify(
            code,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        if not is_valid:
            return Response({
                "success": False,
                "message": message,
            }, status=status.HTTP_400_BAD_REQUEST)

        if purpose == 'agent_login':
            # Agent login must map to an existing active AgentProfile whose user
            # account carries this email. Agents therefore need an email set —
            # without one they cannot receive an OTP at all.
            from apps.dashboard.models import AgentProfile

            agent = AgentProfile.objects.filter(
                user__email=email, is_active=True
            ).first()
            if not agent:
                return Response({
                    "success": False,
                    "message": "No active agent account found for this email.",
                }, status=status.HTTP_403_FORBIDDEN)

            user = agent.user
            user.is_active = True
            user.save(update_fields=['is_active'])

            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "message": "OTP verified successfully.",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": str(user.id),
                        "phone": agent.phone,
                        "email": user.email,
                        "full_name": agent.full_name or user.username,
                        "role": agent.role,
                    }
                }
            }, status=status.HTTP_200_OK)

        # Get or create user — email is the username and the email field
        user = User.objects.filter(email=email).first()
        if not user:
            user, created = User.objects.get_or_create(
                username=email,
                defaults={'email': email, 'is_active': True}
            )
            if not user.email:
                user.email = email
                user.save(update_fields=['email'])
        else:
            created = False
        # Link landlord profiles by email
        from apps.landlords.models import LandlordProfile
        LandlordProfile.objects.filter(email=email, user__isnull=True).update(user=user)

        refresh = RefreshToken.for_user(user)

        return Response({
            "success": True,
            "message": "OTP verified successfully.",
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": str(user.id),
                    "phone": user.username,
                    "email": user.email,
                    "is_new_user": created,
                }
            }
        }, status=status.HTTP_200_OK)