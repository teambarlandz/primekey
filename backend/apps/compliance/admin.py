from django.contrib import admin
from unfold.admin import ModelAdmin

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
    list_filter = ("purpose", "consent_given", "legal_basis", "withdrawn", "created_at")
    search_fields = ("email", "phone", "ip_address")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)
    list_per_page = 50


@admin.register(ExportRequest)
class ExportRequestAdmin(ModelAdmin):
    list_display = (
        "email",
        "phone",
        "status",
        "include_metadata",
        "records_count",
        "verified_at",
        "completed_at",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("email", "phone")
    readonly_fields = ("id", "created_at", "updated_at", "verification_code", "verified_at", "verification_attempts", "download_url", "records_count", "completed_at")
    ordering = ("-created_at",)
    list_per_page = 50


@admin.register(ErasureRequest)
class ErasureRequestAdmin(ModelAdmin):
    list_display = ("email", "phone", "status", "rejected", "rejection_reason", "completed_at", "created_at")
    list_filter = ("status", "rejected", "rejection_reason", "created_at")
    search_fields = ("email", "phone")
    readonly_fields = ("id", "created_at", "updated_at", "verification_code", "verified_at", "verification_attempts", "records_erased", "completed_at")
    ordering = ("-created_at",)
    list_per_page = 50


@admin.register(AnonymizationLog)
class AnonymizationLogAdmin(ModelAdmin):
    list_display = ("lead_phone", "lead_email", "trigger", "triggered_by", "created_at")
    list_filter = ("trigger", "created_at")
    search_fields = ("lead_phone", "lead_email", "lead_id")
    readonly_fields = ("lead_id", "lead_phone", "lead_email", "fields_anonymized", "original_data_hash", "trigger", "triggered_by", "related_request_id", "created_at")
    ordering = ("-created_at",)
