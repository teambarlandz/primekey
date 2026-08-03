from django.contrib import admin

from .models import Property, PropertyImage


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0
    fields = ("image_url", "caption", "is_primary")


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("title", "property_type", "price", "area", "city", "status", "is_featured")
    list_filter = ("property_type", "status", "is_featured", "is_serviced", "is_furnished")
    search_fields = ("title", "address", "area", "city", "state")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("title", "description", "property_type")}),
        ("Pricing", {"fields": ("price", "currency", "is_negotiable")}),
        ("Location", {"fields": ("address", "area", "city", "state")}),
        ("Features", {"fields": ("bedrooms", "bathrooms", "toilets", "is_serviced", "is_furnished")}),
        ("Listing Status", {"fields": ("status", "is_featured")}),
        ("Metadata", {"fields": ("id", "created_at", "updated_at")}),
    )
    inlines = (PropertyImageInline,)
