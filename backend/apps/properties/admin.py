from django import forms
from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import (
    ChoicesDropdownFilter,
    RangeNumericListFilter,
    SliderNumericFilter,
)
from unfold.decorators import display

from .models import Property, PropertyImage


class PropertyAdminForm(forms.ModelForm):
    class Meta:
        model = Property
        fields = "__all__"
        widgets = {
            "bedrooms": forms.NumberInput(attrs={"min": 0}),
            "bathrooms": forms.NumberInput(attrs={"min": 0}),
            "toilets": forms.NumberInput(attrs={"min": 0}),
            "price": forms.NumberInput(attrs={"min": 0, "step": "0.01"}),
        }


class PriceRangeFilter(RangeNumericListFilter):
    title = "Price Range (₦)"
    parameter_name = "price"


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0
    fields = ("image_url", "caption", "is_primary")


@admin.register(Property)
class PropertyAdmin(ModelAdmin):
    form = PropertyAdminForm
    list_display = (
        "title",
        "thumb",
        "purpose_badge",
        "property_type",
        "price",
        "city",
        "status_badge",
        "bedrooms",
        "bathrooms",
        "is_featured",
    )
    list_filter = (
        ("purpose", ChoicesDropdownFilter),
        ("property_type", ChoicesDropdownFilter),
        ("status", ChoicesDropdownFilter),
        ("city", ChoicesDropdownFilter),
        ("state", ChoicesDropdownFilter),
        PriceRangeFilter,
        ("price", SliderNumericFilter),
        "is_featured",
        "is_serviced",
        "is_furnished",
    )
    search_fields = ("title", "address", "area", "city", "state")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    show_full_result_count = True
    list_max_show_all = 200
    save_on_top = True
    date_hierarchy = "created_at"
    fieldsets = (
        (None, {"fields": ("title", "description", "purpose", "property_type")}),
        ("Pricing", {"fields": ("price", "currency", "is_negotiable")}),
        ("Location", {"fields": ("address", "area", "city", "state")}),
        ("Features", {"fields": ("bedrooms", "bathrooms", "toilets", "is_serviced", "is_furnished")}),
        ("Listing Status", {"fields": ("status", "is_featured")}),
        ("Metadata", {"fields": ("id", "created_at", "updated_at")}),
    )
    inlines = (PropertyImageInline,)

    @display(image=True, description="Primary Image")
    def thumb(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary.image_url if primary else None

    @display(label={"available": "success", "under_contract": "warning", "rented": "info", "sold": "danger"})
    def status_badge(self, obj):
        return obj.status

    status_badge.short_description = "Status"

    @display(label={"sale": "primary", "rent": "info", "short_let": "warning"})
    def purpose_badge(self, obj):
        return obj.purpose

    purpose_badge.short_description = "Purpose"

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("images")


@admin.register(PropertyImage)
class PropertyImageAdmin(ModelAdmin):
    list_display = ("property", "thumb", "caption", "is_primary", "created_at")
    list_filter = ("is_primary", "created_at")
    search_fields = ("property__title", "caption", "image_url")
    readonly_fields = ("id", "created_at")
    autocomplete_fields = ("property",)
    ordering = ("-created_at",)
    list_per_page = 50
    list_fullwidth = True
    list_filter_submit = True
    save_on_top = True

    @display(image=True, description="Image")
    def thumb(self, obj):
        return obj.image_url
