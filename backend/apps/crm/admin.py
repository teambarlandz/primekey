from django.contrib import admin
from django.utils import timezone
from unfold.admin import ModelAdmin

from .models import ConciergeLead, ConsentLog, LeadScore, SLAAlert


@admin.register(ConciergeLead)
class ConciergeLeadAdmin(ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "email",
        "preferred_location",
        "property_type",
        "status",
        "tier",
        "assigned_agent",
        "sla_deadline",
        "created_at",
    )
    list_filter = (
        "status",
        "property_type",
        "ndpr_consent",
        "created_at",
    )
    search_fields = ("full_name", "phone", "email", "preferred_location")
    readonly_fields = ("id", "created_at", "updated_at", "sla_breached_at", "consent_timestamp")
    autocomplete_fields = ("assigned_agent", "listing")
    ordering = ("-created_at",)
    list_per_page = 50

    def tier(self, obj):
        try:
            return obj.score_breakdown.tier
        except LeadScore.DoesNotExist:
            return "—"

    tier.short_description = "Tier"

    fieldsets = (
        ("Contact Information", {"fields": ("full_name", "phone", "email")}),
        (
            "Property Sourcing Preferences",
            {"fields": ("preferred_location", "property_type", "budget_min", "budget_max", "bedrooms")},
        ),
        ("Listing Inquiry", {"fields": ("listing", "inquiry_message")}),
        ("Assignment & SLA", {"fields": ("assigned_agent", "sla_deadline", "sla_breached_at", "status")}),
        ("NDPR Compliance", {"fields": ("ndpr_consent", "consent_timestamp")}),
        ("Metadata", {"fields": ("id", "created_at", "updated_at")}),
    )


@admin.register(LeadScore)
class LeadScoreAdmin(ModelAdmin):
    list_display = (
        "lead",
        "total_score",
        "tier",
        "budget_match_score",
        "location_match_score",
        "property_type_match_score",
        "bedrooms_match_score",
        "completeness_score",
        "urgency_score",
        "calculated_at",
    )
    list_filter = ("tier",)
    search_fields = ("lead__full_name", "lead__phone", "lead__email")
    readonly_fields = ("calculated_at",)
    autocomplete_fields = ("lead",)
    ordering = ("-calculated_at",)


@admin.register(SLAAlert)
class SLAAlertAdmin(ModelAdmin):
    list_display = ("lead", "severity", "acknowledged", "created_at")
    list_filter = ("severity", "acknowledged", "created_at")
    search_fields = ("lead__full_name", "lead__phone", "message")
    autocomplete_fields = ("lead",)
    ordering = ("-created_at",)
    list_editable = ("acknowledged",)


@admin.register(ConsentLog)
class ConsentLogAdmin(ModelAdmin):
    list_display = ("lead", "phone", "email", "action", "ip_address", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("lead__full_name", "phone", "email", "ip_address")
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)
