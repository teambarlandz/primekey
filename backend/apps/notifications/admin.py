from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ("title", "recipient_type", "recipient_id", "is_read", "created_at")
    list_filter = ("recipient_type", "is_read", "created_at")
    search_fields = ("title", "message", "recipient_id")
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)
    list_per_page = 50
