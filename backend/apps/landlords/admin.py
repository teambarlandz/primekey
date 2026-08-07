from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import Appointment, DocumentVault, LandlordProfile, PropertyIntake


@admin.register(LandlordProfile)
class LandlordProfileAdmin(ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "email",
        "id_type",
        "verification_badge",
        "property_count",
        "created_at",
    )
    list_filter = (
        ("verification_status", ChoicesDropdownFilter),
        ("id_type", ChoicesDropdownFilter),
        "ndpr_consent",
        "created_at",
    )
    search_fields = ("full_name", "phone", "email", "id_number")
    readonly_fields = ("id", "created_at", "updated_at", "consent_timestamp")
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True

    @display(label={"pending": "warning", "approved": "success", "rejected": "danger"})
    def verification_badge(self, obj):
        return obj.verification_status

    verification_badge.short_description = "Verification"

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
        "status_badge",
        "created_at",
    )
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("property_type", ChoicesDropdownFilter),
        ("city", ChoicesDropdownFilter),
        ("state", ChoicesDropdownFilter),
        "created_at",
    )
    search_fields = ("title", "landlord__full_name", "landlord__phone", "address", "area", "city")
    readonly_fields = ("id", "created_at", "updated_at")
    autocomplete_fields = ("landlord",)
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True

    @display(label={"draft": "neutral", "submitted": "info", "approved": "success", "rejected": "danger"})
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"

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
    list_display = (
        "landlord",
        "preferred_date",
        "time_slot",
        "tour_type",
        "status_badge",
        "created_at",
    )
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("tour_type", ChoicesDropdownFilter),
        "preferred_date",
    )
    search_fields = ("landlord__full_name", "landlord__phone")
    readonly_fields = ("id", "created_at", "updated_at")
    autocomplete_fields = ("landlord",)
    ordering = ("-created_at",)
    date_hierarchy = "preferred_date"
    list_filter_submit = True

    @display(label={"pending": "warning", "confirmed": "info", "completed": "success", "cancelled": "danger"})
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"


@admin.register(DocumentVault)
class DocumentVaultAdmin(ModelAdmin):
    list_display = (
        "landlord",
        "doc_type",
        "review_badge",
        "intake",
        "uploaded_at",
        "reviewed_at",
    )
    list_filter = (
        ("review_status", ChoicesDropdownFilter),
        ("doc_type", ChoicesDropdownFilter),
        "uploaded_at",
    )
    search_fields = ("landlord__full_name", "landlord__phone")
    readonly_fields = ("id", "uploaded_at", "reviewed_at")
    autocomplete_fields = ("landlord", "intake")
    ordering = ("-uploaded_at",)
    list_filter_submit = True

    @display(label={"pending": "warning", "approved": "success", "rejected": "danger"})
    def review_badge(self, obj):
        return obj.review_status

    review_badge.short_description = "Review Status"
