from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ("title", "recipient_type", "recipient_id", "read_badge", "created_at")
    list_filter = (
        ("recipient_type", ChoicesDropdownFilter),
        "is_read",
        "created_at",
    )
    search_fields = ("title", "message", "recipient_id")
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)
    list_per_page = 50
    list_filter_submit = True

    @display(label={True: "success", False: "neutral"})
    def read_badge(self, obj):
        return obj.is_read

    read_badge.short_description = "Read"
