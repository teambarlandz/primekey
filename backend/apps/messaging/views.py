from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.dashboard.permissions import IsAgent
from .models import WhatsAppThread, WhatsAppMessage
from .serializers import (
    WhatsAppThreadSerializer,
    WhatsAppThreadCreateSerializer,
    WhatsAppMessageSerializer,
    WhatsAppMessageCreateSerializer,
)

AGENT_PERMISSIONS = [IsAuthenticated, IsAgent]


class WhatsAppThreadListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        profile = request.user.agent_profile
        threads = WhatsAppThread.objects.prefetch_related('messages')
        if not profile.can_manage:
            # Non-managers only see threads assigned to them.
            threads = threads.filter(assigned_agent=profile)
        serializer = WhatsAppThreadSerializer(threads, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = WhatsAppThreadCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.validated_data

        # Find an existing thread by source or phone
        thread = None
        if data.get("concierge_lead"):
            thread = WhatsAppThread.objects.filter(concierge_lead_id=data["concierge_lead"]).first()
        elif data.get("landlord"):
            thread = WhatsAppThread.objects.filter(landlord_id=data["landlord"]).first()
        if not thread:
            thread = WhatsAppThread.objects.filter(phone=data["phone"]).first()

        if not thread:
            thread = WhatsAppThread.objects.create(
                phone=data["phone"],
                display_name=data.get("display_name", ""),
                concierge_lead_id=data.get("concierge_lead"),
                landlord_id=data.get("landlord"),
                assigned_agent=request.user.agent_profile,
            )
        elif not thread.assigned_agent_id:
            # Claim unassigned threads on first touch.
            thread.assigned_agent = request.user.agent_profile
            thread.save(update_fields=["assigned_agent", "updated_at"])

        body = data.get("message", "")
        if body:
            message = WhatsAppMessage.objects.create(
                thread=thread,
                direction="outbound",
                body=body,
            )
            thread.last_message = body
            thread.last_message_at = message.created_at
            thread.save(update_fields=["last_message", "last_message_at", "updated_at"])

        return Response(
            {"success": True, "data": WhatsAppThreadSerializer(thread).data},
            status=status.HTTP_201_CREATED,
        )


class WhatsAppMessageListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def _get_visible_thread(self, request, pk):
        try:
            thread = WhatsAppThread.objects.get(pk=pk)
        except WhatsAppThread.DoesNotExist:
            return None
        profile = request.user.agent_profile
        if not profile.can_manage and thread.assigned_agent_id != profile.id:
            return None
        return thread

    def get(self, request, pk):
        thread = self._get_visible_thread(request, pk)
        if thread is None:
            return Response(
                {"success": False, "message": "Thread not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        messages = thread.messages.all()
        serializer = WhatsAppMessageSerializer(messages, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, pk):
        thread = self._get_visible_thread(request, pk)
        if thread is None:
            return Response(
                {"success": False, "message": "Thread not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = WhatsAppMessageCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        body = serializer.validated_data["body"]
        message = WhatsAppMessage.objects.create(
            thread=thread,
            direction="outbound",
            body=body,
        )
        thread.last_message = body
        thread.last_message_at = message.created_at
        thread.save(update_fields=["last_message", "last_message_at", "updated_at"])
        return Response(
            {"success": True, "data": WhatsAppMessageSerializer(message).data},
            status=status.HTTP_201_CREATED,
        )
