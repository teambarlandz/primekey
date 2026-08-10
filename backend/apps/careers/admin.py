from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesDropdownFilter
from unfold.decorators import display

from .models import JobOpening


@admin.register(JobOpening)
class JobOpeningAdmin(ModelAdmin):
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
