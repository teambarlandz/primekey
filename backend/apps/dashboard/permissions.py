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
