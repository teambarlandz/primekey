from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import OTPCode


@admin.register(OTPCode)
class OTPCodeAdmin(ModelAdmin):
    list_display = ("phone", "code", "purpose", "used", "expires_at", "created_at")
    list_filter = ("purpose", "used", "created_at")
    search_fields = ("phone", "code")
    readonly_fields = ("id", "created_at", "used_at", "ip_address", "user_agent")
    ordering = ("-created_at",)
    list_per_page = 50
