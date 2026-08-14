import uuid
from django.core.validators import MinValueValidator
from django.db import models


class Property(models.Model):
    """
    Core Property Listing model backing the search grid and detail views.
    Property types align directly with searchSchema.ts options.
    """

    PROPERTY_TYPE_CHOICES = [
        ("self_contain", "Self-Contain / Studio"),
        ("room_and_parlour", "Room & Parlour Self-Contain"),
        ("single_room", "Single Room / Tenement"),
        ("bq", "Boys' Quarters (BQ)"),
        ("short_let", "Short Let / Serviced Apartment"),
        ("flat", "Standard Flat / Apartment"),
        ("maisonette", "Maisonette"),
        ("bungalow", "Bungalow"),
        ("terrace_duplex", "Terraced Duplex / Townhouse"),
        ("semi_detached_duplex", "Semi-Detached Duplex"),
        ("fully_detached_duplex", "Fully Detached Duplex"),
        ("penthouse", "Penthouse"),
        ("mansion", "Mansion / Luxury Villa"),
        ("land", "Residential / Commercial Land"),
        ("commercial", "Shop / Office / Commercial Space"),
    ]

    STATUS_CHOICES = [
        ("available", "Available"),
        ("under_contract", "Under Contract"),
        ("rented", "Rented"),
        ("sold", "Sold"),
    ]

    PURPOSE_CHOICES = [
        ("sale", "For Sale"),
        ("rent", "For Rent"),
        ("short_let", "Short Let"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES,
        default="sale",
        db_index=True,
        verbose_name="Listing Purpose",
    )
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE_CHOICES)

    # Pricing fields (in NGN - Naira)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=10, default="NGN")
    is_negotiable = models.BooleanField(default=False)

    # Location details
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default="Lagos")
    area = models.CharField(max_length=100)  # e.g., Lekki Phase 1, Ikeja GRA, Yaba

    # Features & Specifications
    bedrooms = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    bathrooms = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    toilets = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    is_serviced = models.BooleanField(default=False)
    is_furnished = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "properties"
        verbose_name_plural = "Properties"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - ₦{self.price:,.2f} ({self.area}, {self.city})"


class PropertyImage(models.Model):
    """
    Image gallery assets attached to a property listing.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="images"
    )
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=150, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "property_images"
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"Image for {self.property.title} ({'Primary' if self.is_primary else 'Secondary'})"


class InspectionRequest(models.Model):
    """
    Buyer-facing inspection request. A buyer requests a physical inspection
    of a property; agents receive and confirm/cancel.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    TOUR_TYPE_CHOICES = [
        ("in_person", "In-Person Tour"),
        ("virtual", "Virtual Tour"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="inspection_requests"
    )
    user = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="inspection_requests"
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True, default="")
    preferred_date = models.DateField()
    time_slot = models.CharField(max_length=20)
    tour_type = models.CharField(
        max_length=20, choices=TOUR_TYPE_CHOICES, default="in_person"
    )
    notes = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inspection_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Inspection: {self.full_name} → {self.property.title} ({self.status})"
