from django.contrib import admin
from django.utils import timezone
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import (
    ChoicesDropdownFilter,
    RangeNumericListFilter,
)
from unfold.decorators import display

from .models import ConciergeLead, ConsentLog, LeadScore, SLAAlert


@admin.register(ConciergeLead)
class ConciergeLeadAdmin(ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "email",
        "preferred_location",
        "property_type",
        "status_badge",
        "tier_badge",
        "assigned_agent",
        "sla_state",
        "sla_deadline",
        "created_at",
    )
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("property_type", ChoicesDropdownFilter),
        ("ndpr_consent", ChoicesDropdownFilter),
        "created_at",
    )
    search_fields = ("full_name", "phone", "email", "preferred_location")
    readonly_fields = ("id", "created_at", "updated_at", "sla_breached_at", "consent_timestamp")
    autocomplete_fields = ("assigned_agent", "listing")
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True
    save_on_top = True
    date_hierarchy = "created_at"

    actions = ["close_won", "close_lost", "mark_contacted"]

    @admin.action(description="Mark selected as Closed Won")
    def close_won(self, request, queryset):
        updated = queryset.filter(status__startswith="active_sla_queue").update(status="closed_won")
        self.message_user(request, f"{updated} leads marked as Closed Won.")

    @admin.action(description="Mark selected as Closed Lost")
    def close_lost(self, request, queryset):
        updated = queryset.filter(status__startswith="active_sla_queue").update(status="closed_lost")
        self.message_user(request, f"{updated} leads marked as Closed Lost.")

    @admin.action(description="Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.filter(status__startswith="active_sla_queue").update(status="contacted")
        self.message_user(request, f"{updated} leads marked as Contacted.")

    @display(
        label={
            "active_sla_queue": "warning",
            "assigned": "info",
            "contacted": "primary",
            "closed_won": "success",
            "closed_lost": "danger",
            "erased_ndpr": "neutral",
        }
    )
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"

    @display(label={"HOT": "danger", "WARM": "warning", "COLD": "info"})
    def tier_badge(self, obj):
        try:
            return obj.score_breakdown.tier
        except LeadScore.DoesNotExist:
            return "—"

    tier_badge.short_description = "Tier"

    @display(
        label={
            "ok": "success",
            "due_soon": "warning",
            "breached": "danger",
            "n/a": "neutral",
        }
    )
    def sla_state(self, obj):
        if not obj.sla_deadline:
            return "n/a"
        if obj.sla_breached_at:
            return "breached"
        remaining = obj.sla_deadline - timezone.now()
        if remaining.total_seconds() <= 3600:
            return "due_soon"
        return "ok"

    sla_state.short_description = "SLA"

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
        "tier_badge",
        "budget_match_score",
        "location_match_score",
        "property_type_match_score",
        "bedrooms_match_score",
        "completeness_score",
        "urgency_score",
        "calculated_at",
    )
    list_filter = (("tier", ChoicesDropdownFilter),)
    search_fields = ("lead__full_name", "lead__phone", "lead__email")
    readonly_fields = ("calculated_at",)
    autocomplete_fields = ("lead",)
    ordering = ("-calculated_at",)
    list_fullwidth = True
    list_filter_submit = True
    save_on_top = True

    @display(label={"HOT": "danger", "WARM": "warning", "COLD": "info"})
    def tier_badge(self, obj):
        return obj.tier

    tier_badge.short_description = "Tier"


@admin.register(SLAAlert)
class SLAAlertAdmin(ModelAdmin):
    list_display = ("lead", "severity_badge", "acknowledged", "created_at")
    list_filter = (("severity", ChoicesDropdownFilter), "acknowledged", "created_at")
    search_fields = ("lead__full_name", "lead__phone", "message")
    autocomplete_fields = ("lead",)
    ordering = ("-created_at",)
    list_editable = ("acknowledged",)
    list_filter_submit = True
    save_on_top = True

    @admin.action(description="Acknowledge selected alerts")
    def acknowledge_selected(self, request, queryset):
        updated = queryset.filter(acknowledged=False).update(acknowledged=True)
        self.message_user(request, f"{updated} alerts acknowledged.")

    @display(label={"warning": "warning", "critical": "danger"})
    def severity_badge(self, obj):
        return obj.severity

    severity_badge.short_description = "Severity"


@admin.register(ConsentLog)
class ConsentLogAdmin(ModelAdmin):
    list_display = ("lead", "phone", "email", "action", "ip_address", "created_at")
    list_filter = (("action", ChoicesDropdownFilter), "created_at")
    search_fields = ("lead__full_name", "phone", "email", "ip_address")
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)
    list_filter_submit = True
    save_on_top = True
