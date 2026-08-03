from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import AgentProfile


@admin.register(AgentProfile)
class AgentProfileAdmin(ModelAdmin):
    list_display = ("full_name", "phone", "role", "is_active", "created_at")
    list_filter = ("role", "is_active")
    search_fields = ("full_name", "phone", "user__username", "user__email")
    readonly_fields = ("id", "created_at", "updated_at")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
    list_editable = ("is_active",)
