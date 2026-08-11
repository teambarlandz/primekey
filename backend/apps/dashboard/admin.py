from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import AgentProfile


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
