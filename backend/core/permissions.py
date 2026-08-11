"""Reusable DRF permission classes and access helpers.

Single source of truth for ownership and role checks across apps.
These helpers duck-type the ``phone`` attribute, so they work for landlord
profiles (and any future owner-scoped model) without importing app models
(avoids circular imports).
"""

from rest_framework.permissions import BasePermission


def is_active_agent(user):
    """True for an authenticated user with an active AgentProfile."""
    if not user or not user.is_authenticated:
        return False
    profile = getattr(user, "agent_profile", None)
    return profile is not None and profile.is_active


def is_staff_or_active_agent(user):
    """True for Django staff or an active agent."""
    if not user or not user.is_authenticated:
        return False
    if user.is_staff:
        return True
    return is_active_agent(user)


def owns_profile(user, obj):
    """True when the authenticated user's username matches the object's phone."""
    return (
        user is not None
        and user.is_authenticated
        and obj is not None
        and getattr(obj, "phone", None) == user.username
    )


def can_access_owner(user, obj):
    """Object-level access: the owner themselves or any active agent."""
    return is_active_agent(user) or owns_profile(user, obj)


class IsActiveAgent(BasePermission):
    """Authenticated user with an active AgentProfile."""

    message = "Agent authentication required."

    def has_permission(self, request, view):
        return is_active_agent(getattr(request, "user", None))


class IsStaffOrActiveAgent(BasePermission):
    """Django staff or active agent (for PII-heavy internal endpoints)."""

    message = "Staff or agent privileges required."

    def has_permission(self, request, view):
        return is_staff_or_active_agent(getattr(request, "user", None))


class IsOwnerOrAgent(BasePermission):
    """Object-level: the resource owner or any active agent."""

    message = "You can only access your own resources."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return user is not None and user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return can_access_owner(getattr(request, "user", None), obj)
