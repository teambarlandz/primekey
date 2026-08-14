from django.urls import path
from .views import UserProfileView, FavoriteListView, FavoriteCreateView, FavoriteDeleteView, FavoriteCheckView

app_name = "users"

urlpatterns = [
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("favorites/", FavoriteListView.as_view(), name="favorite-list"),
    path("favorites/toggle/", FavoriteCreateView.as_view(), name="favorite-toggle"),
    path("favorites/<uuid:property_id>/", FavoriteDeleteView.as_view(), name="favorite-delete"),
    path("favorites/<uuid:property_id>/check/", FavoriteCheckView.as_view(), name="favorite-check"),
]
