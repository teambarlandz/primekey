from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Favorite
from .serializers import FavoriteSerializer, FavoriteCreateSerializer


class FavoriteListView(APIView):
    """GET: List all favorites for the authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).select_related(
            "property"
        )
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(
            {
                "success": True,
                "count": favorites.count(),
                "results": serializer.data,
            }
        )


class FavoriteCreateView(APIView):
    """POST: Toggle a favorite (add if not present, remove if present)."""

    permission_classes = [IsAuthenticated]

    @method_decorator(ratelimit(key="ip", rate="30/m", method="POST"), name="post")
    def post(self, request):
        serializer = FavoriteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        property_id = serializer.validated_data["property_id"]

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            property_id=property_id,
        )

        if not created:
            favorite.delete()
            return Response(
                {
                    "success": True,
                    "action": "removed",
                    "message": "Property removed from favorites.",
                }
            )

        return Response(
            {
                "success": True,
                "action": "added",
                "message": "Property saved to favorites.",
                "data": FavoriteSerializer(favorite).data,
            },
            status=status.HTTP_201_CREATED,
        )


class FavoriteDeleteView(APIView):
    """DELETE: Remove a specific favorite by property ID."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, property_id):
        deleted, _ = Favorite.objects.filter(
            user=request.user, property_id=property_id
        ).delete()

        if deleted:
            return Response(
                {
                    "success": True,
                    "message": "Property removed from favorites.",
                }
            )

        return Response(
            {
                "success": False,
                "message": "Favorite not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )


class FavoriteCheckView(APIView):
    """GET: Check if a property is favorited by the current user."""

    permission_classes = [IsAuthenticated]

    def get(self, request, property_id):
        is_favorited = Favorite.objects.filter(
            user=request.user, property_id=property_id
        ).exists()

        return Response(
            {
                "success": True,
                "is_favorited": is_favorited,
            }
        )
