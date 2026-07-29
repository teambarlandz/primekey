import uuid
from django.db import models
from django.conf import settings


class LandlordProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(db_index=True)
    id_type = models.CharField(
        max_length=30,
        choices=[
            ('nin', 'National ID (NIN)'),
            ('passport', 'International Passport'),
            ('driver_license', "Driver's License"),
            ('voter_card', "Permanent Voter's Card"),
        ],
        verbose_name="ID Type"
    )
    id_number = models.CharField(max_length=50, verbose_name="ID Number")
    property_count = models.IntegerField(default=1, verbose_name="Number of Properties to List")
    ndpr_consent = models.BooleanField(default=False)
    consent_timestamp = models.DateTimeField(auto_now_add=True)
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending',
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Landlord Profile"
        verbose_name_plural = "Landlord Profiles"

    def __str__(self):
        return f"{self.full_name} - {self.phone}"


class PropertyIntake(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    landlord = models.ForeignKey(
        LandlordProfile, on_delete=models.CASCADE, related_name='properties'
    )
    title = models.CharField(max_length=200)
    property_type = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_negotiable = models.BooleanField(default=False)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default='Lagos')
    area = models.CharField(max_length=100)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    toilets = models.IntegerField(default=1)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('submitted', 'Submitted'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='draft',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Property Intake"
        verbose_name_plural = "Property Intakes"

    def __str__(self):
        return f"{self.title} - {self.landlord.full_name}"


class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    landlord = models.ForeignKey(
        LandlordProfile, on_delete=models.CASCADE, related_name='appointments'
    )
    preferred_date = models.DateField()
    time_slot = models.CharField(max_length=20)
    tour_type = models.CharField(
        max_length=20,
        choices=[('in_person', 'In-Person'), ('virtual', 'Virtual')],
    )
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Appointment"

    def __str__(self):
        return f"{self.landlord.full_name} - {self.preferred_date} ({self.time_slot})"
