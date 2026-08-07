from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import AnonymizationLog, ConsentLog, ErasureRequest, ExportRequest


@admin.register(ConsentLog)
class ConsentLogAdmin(ModelAdmin):
    list_display = (
        "email",
        "phone",
        "purpose",
        "consent_given",
        "legal_basis",
        "withdrawn",
        "created_at",
    )
    list_filter = (
        ("purpose", ChoicesDropdownFilter),
        "consent_given",
        ("legal_basis", ChoicesDropdownFilter),
        "withdrawn",
        "created_at",
    )
    search_fields = ("email", "phone", "ip_address")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True

    @display(label={True: "success", False: "danger"})
    def consent_given(self, obj):
        return obj.consent_given

    consent_given.short_description = "Consent"

    @display(label={True: "warning", False: "neutral"})
    def withdrawn(self, obj):
        return obj.withdrawn


@admin.register(ExportRequest)
class ExportRequestAdmin(ModelAdmin):
    list_display = (
        "email",
        "phone",
        "status_badge",
        "include_metadata",
        "records_count",
        "verified_at",
        "completed_at",
        "created_at",
    )
    list_filter = (("status", ChoicesDropdownFilter), "created_at")
    search_fields = ("email", "phone")
    readonly_fields = ("id", "created_at", "updated_at", "verification_code", "verified_at", "verification_attempts", "download_url", "records_count", "completed_at")
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True

    @display(
        label={
            "pending": "warning",
            "verified": "info",
            "processing": "primary",
            "completed": "success",
            "failed": "danger",
            "expired": "neutral",
        }
    )
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"


@admin.register(ErasureRequest)
class ErasureRequestAdmin(ModelAdmin):
    list_display = (
        "email",
        "phone",
        "status_badge",
        "rejected",
        "rejection_reason",
        "completed_at",
        "created_at",
    )
    list_filter = (("status", ChoicesDropdownFilter), "rejected", "created_at")
    search_fields = ("email", "phone")
    readonly_fields = ("id", "created_at", "updated_at", "verification_code", "verified_at", "verification_attempts", "records_erased", "completed_at")
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True

    @display(
        label={
            "pending": "warning",
            "verified": "info",
            "processing": "primary",
            "completed": "success",
            "failed": "danger",
            "rejected": "danger",
        }
    )
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"

    @display(label={True: "danger", False: "neutral"})
    def rejected(self, obj):
        return obj.rejected


@admin.register(AnonymizationLog)
class AnonymizationLogAdmin(ModelAdmin):
    list_display = ("lead_phone", "lead_email", "trigger_badge", "triggered_by", "created_at")
    list_filter = (("trigger", ChoicesDropdownFilter), "created_at")
    search_fields = ("lead_phone", "lead_email", "lead_id")
    readonly_fields = ("lead_id", "lead_phone", "lead_email", "fields_anonymized", "original_data_hash", "trigger", "triggered_by", "related_request_id", "created_at")
    ordering = ("-created_at",)
    list_filter_submit = True

    @display(
        label={
            "erasure_request": "info",
            "retention_policy": "primary",
            "admin_action": "warning",
            "sla_breach": "danger",
        }
    )
    def trigger_badge(self, obj):
        return obj.trigger

    trigger_badge.short_description = "Trigger"
