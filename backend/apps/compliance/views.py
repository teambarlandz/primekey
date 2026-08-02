import uuid
import hashlib
import json
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination

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


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


# ===================== CONSENT LOG =====================

class ConsentLogListView(APIView):
    """
    GET /api/v1/compliance/consent-logs/
    List consent logs (authenticated).
    """
    permission_classes = [IsAuthenticated]
    
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
    Create a new data export request (public).
    """
    permission_classes = [AllowAny]
    
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
    Check export request status and get download URL.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            export_request = ExportRequest.objects.get(pk=pk)
        except ExportRequest.DoesNotExist:
            return Response(
                {"success": False, "message": "Export request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(ExportRequestSerializer(export_request).data)


# ===================== DATA ERASURE =====================

class ErasureRequestCreateView(APIView):
    """
    POST /api/v1/compliance/erase/
    Create a new data erasure request (public).
    """
    permission_classes = [AllowAny]
    
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
    Check erasure request status.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            erasure_request = ErasureRequest.objects.get(pk=pk)
        except ErasureRequest.DoesNotExist:
            return Response(
                {"success": False, "message": "Erasure request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(ErasureRequestSerializer(erasure_request).data)


# ===================== ANONYMIZATION LOGS =====================

class AnonymizationLogListView(APIView):
    """
    GET /api/v1/compliance/anonymization-logs/
    List anonymization audit logs (authenticated).
    """
    permission_classes = [IsAuthenticated]
    
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