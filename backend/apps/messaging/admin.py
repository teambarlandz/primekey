from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import WhatsAppMessage, WhatsAppThread


class WhatsAppMessageInline(admin.TabularInline):
    model = WhatsAppMessage
    extra = 0
    readonly_fields = ("direction", "body", "created_at")
    can_delete = False


@admin.register(WhatsAppThread)
class WhatsAppThreadAdmin(ModelAdmin):
    list_display = ("display_name", "phone", "concierge_lead", "landlord", "last_message", "last_message_at")
    search_fields = ("display_name", "phone", "last_message")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-last_message_at", "-updated_at")
    inlines = (WhatsAppMessageInline,)
    save_on_top = True


@admin.register(WhatsAppMessage)
class WhatsAppMessageAdmin(ModelAdmin):
    list_display = ("thread", "direction_badge", "body", "created_at")
    list_filter = (("direction", ChoicesDropdownFilter), "created_at")
    search_fields = ("body", "thread__phone", "thread__display_name")
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)
    list_per_page = 100
    list_filter_submit = True
    save_on_top = True

    @display(label={"inbound": "info", "outbound": "primary"})
    def direction_badge(self, obj):
        return obj.direction

    direction_badge.short_description = "Direction"
