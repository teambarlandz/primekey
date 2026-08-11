"""Object-level access helpers for landlord-owned resources.

Landlord resources are owned by the phone-authenticated user whose username
matches the landlord profile's phone number. Agents (and managers) may access
all landlord resources as part of the operations workflow.

Canonical implementations live in ``core.permissions``; these thin wrappers
keep the existing call sites (views, notifications) stable.
"""

from core.permissions import can_access_owner, is_active_agent, owns_profile


def is_agent(user):
    return is_active_agent(user)


def owns_landlord(user, landlord):
    return owns_profile(user, landlord)


def can_access_landlord(user, landlord):
    return can_access_owner(user, landlord)
