"""Object-level access helpers for landlord-owned resources.

Landlord resources are owned by the phone-authenticated user whose username
matches the landlord profile's phone number. Agents (and managers) may access
all landlord resources as part of the operations workflow.
"""


def is_agent(user):
    profile = getattr(user, "agent_profile", None)
    return profile is not None and profile.is_active


def owns_landlord(user, landlord):
    return (
        user.is_authenticated
        and landlord is not None
        and landlord.phone == user.username
    )


def can_access_landlord(user, landlord):
    return is_agent(user) or owns_landlord(user, landlord)
