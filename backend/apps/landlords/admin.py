from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Appointment, DocumentVault, LandlordProfile, PropertyIntake


@admin.register(LandlordProfile)
class LandlordProfileAdmin(ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "email",
        "id_type",
        "verification_status",
        "property_count",
        "created_at",
    )
    list_filter = ("verification_status", "id_type", "ndpr_consent", "created_at")
    search_fields = ("full_name", "phone", "email", "id_number")
    readonly_fields = ("id", "created_at", "updated_at", "consent_timestamp")
    ordering = ("-created_at",)
    list_per_page = 50

    fieldsets = (
        ("Contact Information", {"fields": ("full_name", "phone", "email")}),
        ("Verification (KYC)", {"fields": ("id_type", "id_number", "verification_status")}),
        ("Onboarding", {"fields": ("property_count", "ndpr_consent", "consent_timestamp")}),
        ("Metadata", {"fields": ("id", "created_at", "updated_at")}),
    )


@admin.register(PropertyIntake)
class PropertyIntakeAdmin(ModelAdmin):
    list_display = (
        "title",
        "landlord",
        "property_type",
        "price",
        "area",
        "city",
        "state",
        "status",
        "created_at",
    )
    list_filter = ("status", "property_type", "city", "state", "created_at")
    search_fields = ("title", "landlord__full_name", "landlord__phone", "address", "area", "city")
    readonly_fields = ("id", "created_at", "updated_at")
    autocomplete_fields = ("landlord",)
    ordering = ("-created_at",)
    list_per_page = 50

    fieldsets = (
        (None, {"fields": ("title", "landlord", "property_type", "description")}),
        ("Pricing", {"fields": ("price", "is_negotiable")}),
        ("Location", {"fields": ("address", "area", "city", "state")}),
        ("Features", {"fields": ("bedrooms", "bathrooms", "toilets")}),
        ("Status", {"fields": ("status",)}),
        ("Metadata", {"fields": ("id", "created_at", "updated_at")}),
    )


@admin.register(Appointment)
class AppointmentAdmin(ModelAdmin):
    list_display = ("landlord", "preferred_date", "time_slot", "tour_type", "status", "created_at")
    list_filter = ("status", "tour_type", "preferred_date")
    search_fields = ("landlord__full_name", "landlord__phone")
    readonly_fields = ("id", "created_at", "updated_at")
    autocomplete_fields = ("landlord",)
    ordering = ("-created_at",)
    date_hierarchy = "preferred_date"


@admin.register(DocumentVault)
class DocumentVaultAdmin(ModelAdmin):
    list_display = (
        "landlord",
        "doc_type",
        "review_status",
        "intake",
        "uploaded_at",
        "reviewed_at",
    )
    list_filter = ("review_status", "doc_type", "uploaded_at")
    search_fields = ("landlord__full_name", "landlord__phone")
    readonly_fields = ("id", "uploaded_at", "reviewed_at")
    autocomplete_fields = ("landlord", "intake")
    ordering = ("-uploaded_at",)
    list_editable = ("review_status",)
