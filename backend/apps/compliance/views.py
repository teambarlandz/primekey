import uuid
import hashlib
import json
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from django.conf import settings
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from core.security import get_client_ip
from apps.dashboard.permissions import IsStaffOrAgent
from .models import (
    ConsentLog, ExportRequest, ErasureRequest, AnonymizationLog
)
from .serializers import (
    ConsentLogSerializer,
    ExportRequestSerializer, ExportRequestCreateSerializer, ExportRequestVerifySerializer,
    ErasureRequestSerializer, ErasureRequestCreateSerializer, ErasureRequestVerifySerializer,
    AnonymizationLogSerializer,
)
from apps.crm.models import ConciergeLead, ConsentLog as CRMConsentLog
from apps.properties.models import Property


def _email_ip_key(group, request):
    """Rate-limit bucket per email + client IP."""
    return f"{get_client_ip(request)}:{request.data.get('email', 'unknown')}"


def _request_owned_by(request, export_request):
    """Whether the authenticated user owns a data subject request."""
    user = request.user
    if not user.is_authenticated:
        return False
    if export_request.phone and export_request.phone == user.username:
        return True
    if (
        export_request.email
        and user.email
        and export_request.email.lower() == user.email.lower()
    ):
        return True
    return False


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


# ===================== CONSENT LOG =====================

class ConsentLogListView(APIView):
    """
    GET /api/v1/compliance/consent-logs/
    List consent logs (staff or agent only - contains PII).
    """
    permission_classes = [IsAuthenticated, IsStaffOrAgent]
    
    def get(self, request):
        queryset = ConsentLog.objects.all()
        
        # Filtering
        purpose = request.query_params.get('purpose')
        if purpose:
            queryset = queryset.filter(purpose=purpose)
        
        consent_given = request.query_params.get('consent_given')
        if consent_given is not None:
            queryset = queryset.filter(consent_given=consent_given.lower() == 'true')
        
        email = request.query_params.get('email')
        if email:
            queryset = queryset.filter(email__icontains=email)
        
        phone = request.query_params.get('phone')
        if phone:
            queryset = queryset.filter(phone__icontains=phone)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        queryset = queryset.order_by('-created_at')
        
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ConsentLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# ===================== DATA EXPORT =====================

class ExportRequestCreateView(APIView):
    """
    POST /api/v1/compliance/export/
    Create a new data export request (public, rate-limited per email+IP).
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_email_ip_key, rate='10/m', method='POST'))
    def post(self, request):
        serializer = ExportRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            export_request = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Export request submitted. Verification code sent to email.",
                    "data": ExportRequestSerializer(export_request).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"success": False, "message": "Validation failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ExportRequestVerifyView(APIView):
    """
    POST /api/v1/compliance/export/verify/
    Verify export request with 6-digit code.
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_email_ip_key, rate='10/m', method='POST'))
    def post(self, request):
        serializer = ExportRequestVerifySerializer(data=request.data)
        if serializer.is_valid():
            export_request = serializer.validated_data['export_request']
            
            # Mark as verified
            export_request.verified_at = timezone.now()
            export_request.status = 'processing'
            export_request.save(update_fields=['verified_at', 'status'])
            
            # Trigger async compilation
            from django_q.tasks import async_task
            from .tasks import compile_export_data
            async_task(compile_export_data, str(export_request.id))
            
            return Response(
                {
                    "success": True,
                    "message": "Verification successful. Export compilation started.",
                    "data": ExportRequestSerializer(export_request).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"success": False, "message": "Verification failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ExportRequestStatusView(APIView):
    """
    GET /api/v1/compliance/export/<uuid:pk>/
    Check export request status and get download URL (owner only).
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            export_request = ExportRequest.objects.get(pk=pk)
        except ExportRequest.DoesNotExist:
            return Response(
                {"success": False, "message": "Export request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not _request_owned_by(request, export_request):
            return Response(
                {"success": False, "message": "You can only view your own export requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response(ExportRequestSerializer(export_request).data)


# ===================== DATA ERASURE =====================

class ErasureRequestCreateView(APIView):
    """
    POST /api/v1/compliance/erase/
    Create a new data erasure request (public, rate-limited per email+IP).
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_email_ip_key, rate='10/m', method='POST'))
    def post(self, request):
        serializer = ErasureRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            erasure_request = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Erasure request submitted. Verification code sent to email.",
                    "data": ErasureRequestSerializer(erasure_request).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"success": False, "message": "Validation failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ErasureRequestVerifyView(APIView):
    """
    POST /api/v1/compliance/erase/verify/
    Verify erasure request with 6-digit code.
    """
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key=_email_ip_key, rate='10/m', method='POST'))
    def post(self, request):
        serializer = ErasureRequestVerifySerializer(data=request.data)
        if serializer.is_valid():
            erasure_request = serializer.validated_data['erasure_request']
            
            # Mark as verified
            erasure_request.verified_at = timezone.now()
            erasure_request.status = 'processing'
            erasure_request.save(update_fields=['verified_at', 'status'])
            
            # Trigger async erasure
            from django_q.tasks import async_task
            from .tasks import process_erasure_request
            async_task(process_erasure_request, str(erasure_request.id))
            
            return Response(
                {
                    "success": True,
                    "message": "Verification successful. Erasure process started.",
                    "data": ErasureRequestSerializer(erasure_request).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"success": False, "message": "Verification failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ErasureRequestStatusView(APIView):
    """
    GET /api/v1/compliance/erase/<uuid:pk>/
    Check erasure request status (owner only).
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            erasure_request = ErasureRequest.objects.get(pk=pk)
        except ErasureRequest.DoesNotExist:
            return Response(
                {"success": False, "message": "Erasure request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not _request_owned_by(request, erasure_request):
            return Response(
                {"success": False, "message": "You can only view your own erasure requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response(ErasureRequestSerializer(erasure_request).data)


# ===================== ANONYMIZATION LOGS =====================

class AnonymizationLogListView(APIView):
    """
    GET /api/v1/compliance/anonymization-logs/
    List anonymization audit logs (staff or agent only).
    """
    permission_classes = [IsAuthenticated, IsStaffOrAgent]
    
    def get(self, request):
        queryset = AnonymizationLog.objects.all()
        
        # Filtering
        trigger = request.query_params.get('trigger')
        if trigger:
            queryset = queryset.filter(trigger=trigger)
        
        lead_id = request.query_params.get('lead_id')
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
        
        lead_phone = request.query_params.get('lead_phone')
        if lead_phone:
            queryset = queryset.filter(lead_phone__icontains=lead_phone)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        queryset = queryset.order_by('-created_at')
        
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = AnonymizationLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# ===================== EXPORT DOWNLOAD =====================

class ExportDownloadView(APIView):
    """
    GET /api/v1/compliance/export/download/<uuid:pk>/
    Download a completed data export (owner only, until expiry).
    The file lives outside MEDIA_ROOT so it is never served by nginx directly.
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(ratelimit(key='ip', rate='5/m', method='GET'), name='get')
    def get(self, request, pk):
        try:
            export_request = ExportRequest.objects.get(pk=pk)
        except ExportRequest.DoesNotExist:
            return Response(
                {"success": False, "message": "Export request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not _request_owned_by(request, export_request):
            return Response(
                {"success": False, "message": "You can only download your own export."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if export_request.status != 'completed':
            return Response(
                {"success": False, "message": "Export is not ready for download."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if export_request.expires_at and timezone.now() > export_request.expires_at:
            return Response(
                {"success": False, "message": "Export download link has expired."},
                status=status.HTTP_410_GONE,
            )

        file_path = settings.EXPORT_STORAGE_DIR / f"{export_request.id}.json"
        if not file_path.exists():
            return Response(
                {"success": False, "message": "Export file not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        from django.http import FileResponse

        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/json',
        )
        response['Content-Disposition'] = (
            f'attachment; filename="primekey-data-export-{export_request.id}.json"'
        )
        return response