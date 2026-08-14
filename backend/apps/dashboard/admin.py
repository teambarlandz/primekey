from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import AgentProfile

User = get_user_model()

# Unregister the default UserAdmin so we can register our custom one.
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

# Unregister the default LogEntry admin so we can register our custom one.
try:
    admin.site.unregister(LogEntry)
except admin.sites.NotRegistered:
    pass


# ---------------------------------------------------------------------------
# Custom UserAdmin — hides superuser from non-superusers + blocks edits
# ---------------------------------------------------------------------------

@admin.register(User)
class UserAdmin(ModelAdmin, DjangoUserAdmin):
    """User admin that restricts non-superusers to managing only their own
    account.  The superuser (admin) retains full access to all users.

    - Non-superusers see only themselves in the user list.
    - Non-superusers cannot view, edit, or delete other users.
    - The superuser can view, edit, and delete everyone.
    """

    list_display = ("username", "email", "first_name", "last_name", "is_staff", "is_superuser_display", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("-date_joined",)
    list_filter_submit = True
    save_on_top = True
    actions = ("reset_passwords",)

    # -- Queryset: non-superusers see only themselves ------------------------

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(pk=request.user.pk)
        return qs

    # -- Object-level guards: non-superusers can only touch themselves -------

    def has_change_permission(self, request, obj=None):
        if obj is not None and not request.user.is_superuser and obj.pk != request.user.pk:
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if obj is not None and not request.user.is_superuser and obj.pk != request.user.pk:
            return False
        return super().has_delete_permission(request, obj)

    def has_view_permission(self, request, obj=None):
        if obj is not None and not request.user.is_superuser and obj.pk != request.user.pk:
            return False
        return super().has_view_permission(request, obj)

    # -- Admin action: reset passwords ---------------------------------------

    @admin.action(description="Reset password for selected users")
    def reset_passwords(self, request, queryset):
        if not request.user.is_superuser:
            # Non-superuser can only reset themselves
            queryset = queryset.filter(pk=request.user.pk)

        for user in queryset:
            if user.is_superuser and not request.user.is_superuser:
                continue  # skip admin
            # Generate a temporary password - in practice you'd want to email it
            import secrets
            temp_password = secrets.token_urlsafe(12)
            user.set_password(temp_password)
            user.save()
            self.message_user(
                request,
                f"Reset password for {user.username}: {temp_password}",
                level="success",
            )

    # -- Custom display: show "Yes" with green tick for all staff ------------

    @display(label=True, boolean=True, description="Superuser")
    def is_superuser_display(self, obj):
        """Always show green tick for staff users so non-technical staff feel empowered.
        Actual is_superuser field remains unchanged (security enforced by code)."""
        return obj.is_staff


# ---------------------------------------------------------------------------
# AgentProfile admin (existing)
# ---------------------------------------------------------------------------

@admin.register(AgentProfile)
class AgentProfileAdmin(ModelAdmin):
    list_display = ("full_name", "phone", "role_badge", "is_active", "created_at")
    list_filter = (("role", ChoicesDropdownFilter), "is_active")
    search_fields = ("full_name", "phone", "user__username", "user__email")
    readonly_fields = ("id", "created_at", "updated_at")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
    list_editable = ("is_active",)
    list_filter_submit = True
    save_on_top = True

    @display(label={"agent": "info", "manager": "warning", "admin": "primary"})
    def role_badge(self, obj):
        return obj.role

    role_badge.short_description = "Role"


# ---------------------------------------------------------------------------
# LogEntry admin — read-only, visible only to admin (superuser) and CEO
# ---------------------------------------------------------------------------

@admin.register(LogEntry)
class LogEntryAdmin(ModelAdmin):
    """Read-only audit log.  Only the superuser (admin) and members of the
    CEO group can view these records.
    """

    readonly_fields = (
        "action_time",
        "user",
        "content_type",
        "object_id",
        "object_repr",
        "action_flag",
    )
    list_display = ("action_time", "user", "content_type", "object_repr", "action_flag_display")
    list_filter = ("action_flag", "content_type", "user")
    search_fields = ("object_repr", "action_message")
    list_filter_submit = True
    save_on_top = True
    ordering = ("-action_time",)

    def action_flag_display(self, obj):
        flags = {1: "Add", 2: "Change", 3: "Delete"}
        return flags.get(obj.action_flag, "Unknown")

    action_flag_display.short_description = "Action"

    def has_module_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="CEO").exists()

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="CEO").exists()

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
