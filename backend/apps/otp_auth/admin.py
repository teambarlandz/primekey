from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import OTPCode


@admin.register(OTPCode)
class OTPCodeAdmin(ModelAdmin):
    list_display = ("phone", "code", "purpose", "used_badge", "expires_at", "created_at")
    list_filter = (
        ("purpose", ChoicesDropdownFilter),
        "used",
        "created_at",
    )
    search_fields = ("phone", "code")
    readonly_fields = ("id", "created_at", "used_at", "ip_address", "user_agent")
    ordering = ("-created_at",)
    list_per_page = 50
    list_filter_submit = True

    @display(label={True: "danger", False: "success"})
    def used_badge(self, obj):
        return obj.used

    used_badge.short_description = "Used"
