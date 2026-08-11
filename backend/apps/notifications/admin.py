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
    save_on_top = True
    date_hierarchy = "created_at"

    actions = ["mark_read", "mark_unread"]

    @admin.action(description="Mark selected as read")
    def mark_read(self, request, queryset):
        updated = queryset.filter(is_read=False).update(is_read=True)
        self.message_user(request, f"{updated} notifications marked as read.")

    @admin.action(description="Mark selected as unread")
    def mark_unread(self, request, queryset):
        updated = queryset.filter(is_read=True).update(is_read=False)
        self.message_user(request, f"{updated} notifications marked as unread.")

    @display(label={True: "success", False: "neutral"})
    def read_badge(self, obj):
        return obj.is_read

    read_badge.short_description = "Read"
