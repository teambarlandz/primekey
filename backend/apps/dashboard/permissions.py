from rest_framework.permissions import BasePermission


class IsAgent(BasePermission):
    """
    Grants access only to authenticated users with an active AgentProfile.
    """

    message = "Agent authentication required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, 'agent_profile', None)
        return profile is not None and profile.is_active


class IsManager(BasePermission):
    """
    Grants access only to agents with manager-level privileges (approvals).
    """

    message = "Manager privileges required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, 'agent_profile', None)
        return profile is not None and profile.is_active and profile.can_manage


class IsStaffOrAgent(BasePermission):
    """
    Grants access to Django staff users or active agents.
    Used for PII-heavy internal endpoints (compliance audit logs).
    """

    message = "Staff or agent privileges required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        profile = getattr(user, 'agent_profile', None)
        return profile is not None and profile.is_active
