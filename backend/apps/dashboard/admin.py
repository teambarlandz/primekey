from django.contrib import admin
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


# ---------------------------------------------------------------------------
# Custom UserAdmin — hides superuser from non-superusers + blocks edits
# ---------------------------------------------------------------------------

@admin.register(User)
class UserAdmin(ModelAdmin, DjangoUserAdmin):
    """User admin that (a) hides the superuser account from non-superusers
    and (b) prevents non-superusers from editing/deleting the superuser.

    Inherits fieldsets and inlines from Django's ``UserAdmin`` so the
    change-form stays fully functional.
    """

    list_display = ("username", "email", "first_name", "last_name", "is_staff", "is_superuser", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("-date_joined",)
    list_filter_submit = True
    save_on_top = True

    # -- Queryset: hide superuser from non-superusers (R5) -------------------

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(is_superuser=False)
        return qs

    # -- Object-level guards: block non-superusers from touching admin (R3) ---

    def has_change_permission(self, request, obj=None):
        if obj is not None and obj.is_superuser and not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if obj is not None and obj.is_superuser and not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)

    def has_view_permission(self, request, obj=None):
        if obj is not None and obj.is_superuser and not request.user.is_superuser:
            return False
        return super().has_view_permission(request, obj)


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
