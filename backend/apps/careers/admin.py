from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import JobApplication, JobOpening


class CareersStaffRequiredMixin:
    """Allow any authenticated staff user to manage careers models."""

    def has_module_permission(self, request, obj=None):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(JobOpening)
class JobOpeningAdmin(CareersStaffRequiredMixin, ModelAdmin):
    list_display = ("title", "team", "location", "employment_type_badge", "is_active", "order", "created_at")
    list_filter = (
        ("team", ChoicesDropdownFilter),
        ("location", ChoicesDropdownFilter),
        ("employment_type", ChoicesDropdownFilter),
        "is_active",
    )
    search_fields = ("title", "team", "location")
    ordering = ("order", "-created_at")
    readonly_fields = ("id", "created_at", "updated_at")
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    save_on_top = True
    date_hierarchy = "created_at"
    fieldsets = (
        (None, {"fields": ("title", "team", "location", "employment_type")}),
        ("Details", {"fields": ("summary", "application_email")}),
        ("Publishing", {"fields": ("is_active", "order")}),
        ("Metadata", {"fields": ("id", "created_at", "updated_at")}),
    )

    @display(label={"full_time": "success", "part_time": "warning", "contract": "info", "internship": "danger"})
    def employment_type_badge(self, obj):
        return obj.employment_type

    employment_type_badge.short_description = "Employment Type"


@admin.register(JobApplication)
class JobApplicationAdmin(CareersStaffRequiredMixin, ModelAdmin):
    list_display = (
        "applicant_name",
        "job_title",
        "status_badge",
        "email",
        "created_at",
    )
    list_filter = (
        ("status", ChoicesDropdownFilter),
        ("job_opening", ChoicesDropdownFilter),
    )
    search_fields = (
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "job_opening__title",
    )
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    save_on_top = True
    date_hierarchy = "created_at"
    fieldsets = (
        (None, {"fields": ("job_opening", "status")}),
        (
            "Applicant Information",
            {"fields": ("first_name", "middle_name", "last_name", "email", "phone")},
        ),
        (
            "Application Materials",
            {"fields": ("cover_letter", "resume")},
        ),
        (
            "Compliance",
            {"fields": ("ndpr_consent",)},
        ),
        (
            "Metadata",
            {"fields": ("id", "created_at", "updated_at")},
        ),
    )

    actions = ["shortlist_selected", "reject_selected"]

    @admin.action(description="Shortlist selected applicants")
    def shortlist_selected(self, request, queryset):
        updated = queryset.filter(status__in=["pending", "reviewed"]).update(status="shortlisted")
        self.message_user(request, f"{updated} applicants shortlisted.")

    @admin.action(description="Reject selected applicants")
    def reject_selected(self, request, queryset):
        updated = queryset.filter(status__in=["pending", "reviewed"]).update(status="rejected")
        self.message_user(request, f"{updated} applicants rejected.")

    @display(
        label={
            "pending": "warning",
            "reviewed": "info",
            "shortlisted": "success",
            "rejected": "danger",
        }
    )
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"

    def applicant_name(self, obj):
        return obj.full_name

    applicant_name.short_description = "Applicant"

    def job_title(self, obj):
        return obj.job_opening.title

    job_title.short_description = "Position"
