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


def _phone_ip_key(group, request):
    """Rate-limit bucket per identifier (phone or email) + client IP."""
    ident = request.data.get('phone') or request.data.get('email') or 'unknown'
    return f"{get_client_ip(request)}:{ident}"


class SendOTPView(APIView):
    """
    POST /api/v1/auth/otp/send/
    Send a 6-digit OTP code to phone (Sendchamp SMS) or email (Resend).
    Body: {phone?, email?, channel?: 'sms'|'email', purpose}
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

        phone = (serializer.validated_data.get('phone') or '').strip() or None
        email = (serializer.validated_data.get('email') or '').strip() or None
        channel = serializer.validated_data.get('channel', 'sms' if phone else 'email')
        purpose = serializer.validated_data['purpose']

        # Create OTP code (stores digest only; plaintext in _plaintext_code)
        otp = OTPCode.create_otp(
            phone=phone,
            email=email,
            purpose=purpose,
            channel=channel,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        # Route to correct provider: Sendchamp for SMS, Resend for email
        ident = phone or email or "unknown"
        try:
            if channel == 'email' and email:
                from .services import send_otp_via_resend
                sent = send_otp_via_resend(email, otp._plaintext_code, purpose)
                if sent:
                    logger.info("OTP sent via Resend to %s (purpose=%s)", email, purpose)
                else:
                    logger.info("OTP created for %s (purpose=%s) — Resend not configured, dev_code available", email, purpose)
            else:
                from .services import send_otp_via_sendchamp
                sent = send_otp_via_sendchamp(phone, otp._plaintext_code, purpose)
                if sent:
                    logger.info("OTP sent via Sendchamp to %s (purpose=%s)", phone, purpose)
                else:
                    logger.info("OTP created for %s (purpose=%s) — Sendchamp not configured, dev_code available", phone, purpose)
        except Exception as exc:
            logger.exception("OTP provider failed for %s: %s", ident, exc)
            # In production, surface delivery failure so client can retry
            if not settings.DEBUG:
                return Response({
                    "success": False,
                    "message": "Failed to deliver OTP. Please try again in a moment.",
                }, status=status.HTTP_502_BAD_GATEWAY)
            # In DEBUG, still return success with dev_code so flow is testable

        response_data = {
            "purpose": purpose,
            "channel": channel,
            "expires_in_minutes": 5,
        }
        if phone:
            response_data["phone"] = phone
        if email:
            response_data["email"] = email
        # Only expose the plaintext code to loopback clients while DEBUG is
        # enabled. Never in production, even if DEBUG is accidentally on.
        if is_dev_client(request):
            response_data["dev_code"] = otp._plaintext_code

        message = "OTP sent successfully. Please check your email." if channel == 'email' else "OTP sent successfully. Please check your phone."
        return Response({
            "success": True,
            "message": message,
            "data": response_data,
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/v1/auth/otp/verify/
    Verify the OTP code (SMS or email) and return JWT tokens if valid.
    Body: {phone?, email?, code, purpose}
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

        phone = (serializer.validated_data.get('phone') or '').strip() or None
        email = (serializer.validated_data.get('email') or '').strip() or None
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        # Find the latest unused OTP for this identifier/purpose
        qs = OTPCode.objects.filter(purpose=purpose, used=False)
        if email:
            qs = qs.filter(email=email)
        elif phone:
            qs = qs.filter(phone=phone)
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

        ident = phone or email

        if purpose == 'agent_login':
            # Agent login must map to an existing active AgentProfile
            # Supports phone (Sendchamp) and email (Resend) — match either
            from apps.dashboard.models import AgentProfile

            agent = None
            if phone:
                agent = AgentProfile.objects.filter(phone=phone, is_active=True).first()
            if not agent and email:
                # Try email match via linked user
                agent = AgentProfile.objects.filter(user__email=email, is_active=True).first()
                if not agent:
                    agent = AgentProfile.objects.filter(phone=email, is_active=True).first()
            if not agent:
                return Response({
                    "success": False,
                    "message": "No active agent account found for this identifier.",
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
                        "phone": phone or agent.phone,
                        "email": email or user.email,
                        "full_name": agent.full_name or user.username,
                        "role": agent.role,
                    }
                }
            }, status=status.HTTP_200_OK)

        # Get or create user — phone uses username, email uses email field
        if email and not phone:
            # Email OTP: lookup by email, fallback to username=email
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
        else:
            # Phone OTP (original path, also covers phone+email together)
            user, created = User.objects.get_or_create(
                username=phone,
                defaults={'is_active': True, 'email': email or ''}
            )
            if email and not user.email:
                user.email = email
                user.save(update_fields=['email'])
            # Link any existing landlord profiles matching this phone
            from apps.landlords.models import LandlordProfile
            LandlordProfile.objects.filter(phone=phone, user__isnull=True).update(user=user)
            if email:
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