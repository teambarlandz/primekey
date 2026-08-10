from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.landlords.access import can_access_landlord, is_agent
from .models import Notification
from .serializers import NotificationSerializer, NotificationReadSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recipient_type = request.query_params.get("recipient_type")
        recipient_id = request.query_params.get("recipient_id")

        if not recipient_type:
            return Response(
                {"success": False, "message": "recipient_type is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if recipient_type == "agent":
            if not is_agent(request.user):
                return Response(
                    {"success": False, "message": "Agent authentication required."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            notifications = Notification.objects.filter(recipient_type="agent")
        else:
            if not recipient_id:
                return Response(
                    {"success": False, "message": "recipient_id is required for this recipient type."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            from apps.landlords.models import LandlordProfile

            try:
                landlord = LandlordProfile.objects.get(pk=recipient_id)
            except (LandlordProfile.DoesNotExist, ValueError):
                return Response(
                    {"success": False, "message": "Landlord not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not can_access_landlord(request.user, landlord):
                return Response(
                    {"success": False, "message": "You can only view your own notifications."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            notifications = Notification.objects.filter(
                recipient_type=recipient_type,
                recipient_id=recipient_id,
            )
        serializer = NotificationSerializer(notifications, many=True)
        unread = notifications.filter(is_read=False).count()
        return Response(
            {"success": True, "data": serializer.data, "unread_count": unread},
            status=status.HTTP_200_OK,
        )


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return Response(
                {"success": False, "message": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if notification.recipient_type == "agent":
            if not is_agent(request.user):
                return Response(
                    {"success": False, "message": "Agent authentication required."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            from apps.landlords.models import LandlordProfile

            try:
                landlord = LandlordProfile.objects.get(pk=notification.recipient_id)
            except (LandlordProfile.DoesNotExist, ValueError):
                landlord = None
            if not can_access_landlord(request.user, landlord):
                return Response(
                    {"success": False, "message": "You can only update your own notifications."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = NotificationReadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        notification.is_read = serializer.validated_data["is_read"]
        notification.save(update_fields=["is_read"])
        return Response(
            {"success": True, "data": NotificationSerializer(notification).data},
            status=status.HTTP_200_OK,
        )
