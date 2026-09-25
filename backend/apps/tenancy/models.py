import uuid
from datetime import date, timedelta
import calendar

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Unit(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Under Maintenance'),
    ]

    UNIT_TYPE_CHOICES = [
        ('self_contain', 'Self-Contain'),
        ('room_and_parlour', 'Room & Parlour'),
        ('single_room', 'Single Room'),
        ('bq', "Boys' Quarters"),
        ('flat', 'Flat'),
        ('studio', 'Studio'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='units',
    )
    unit_number = models.CharField(max_length=20)
    unit_type = models.CharField(max_length=20, choices=UNIT_TYPE_CHOICES, default='flat')
    bedrooms = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    bathrooms = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    is_furnished = models.BooleanField(default=False)
    description = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenancy_units'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['property', 'unit_number'], name='unique_property_unit_number')
        ]

    def __str__(self):
        return f"{self.property.title} - Unit {self.unit_number} ({self.get_status_display()})"


class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.ForeignKey(
        Unit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tenant',
    )
    lease = models.ForeignKey(
        'Lease',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tenants_via_lease',
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True, null=True)
    id_type = models.CharField(
        max_length=30,
        choices=[
            ('nin', 'National ID (NIN)'),
            ('passport', 'International Passport'),
            ('driver_license', "Driver's License"),
            ('voter_card', "Permanent Voter's Card"),
        ],
        blank=True,
        null=True,
    )
    id_number = models.CharField(max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenancy_tenants'
        ordering = ['-created_at']

    def __str__(self):
        unit_info = f" Unit {self.unit.unit_number}" if self.unit else ""
        prop_info = f" - {self.unit.property.title}" if self.unit else ""
        return f"{self.full_name}{unit_info}{prop_info}"


class Lease(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('terminated', 'Terminated'),
        ('pending', 'Pending'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name='leases',
    )
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='leases',
    )
    landlord = models.ForeignKey(
        'landlords.LandlordProfile',
        on_delete=models.CASCADE,
        related_name='leases',
    )
    agent = models.ForeignKey(
        'dashboard.AgentProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leases',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    rent_due_day = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(31)])
    rent_frequency = models.CharField(
        max_length=10,
        choices=[('monthly', 'Monthly'), ('weekly', 'Weekly'), ('quarterly', 'Quarterly')],
        default='monthly',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    quit_notice_date = models.DateField(null=True, blank=True)
    quit_notice_reason = models.TextField(blank=True, default='')
    notice_period_days = models.IntegerField(default=30)
    ndpr_consent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenancy_leases'
        ordering = ['-created_at']

    def __str__(self):
        return f"Lease: {self.tenant.full_name} - {self.unit.property.title} Unit {self.unit.unit_number}"

    @property
    def is_expired(self) -> bool:
        return self.end_date < timezone.localdate()

    @property
    def days_until_expiry(self) -> int:
        return (self.end_date - timezone.localdate()).days

    @property
    def next_rent_due(self) -> date:
        today = timezone.localdate()
        if today.day <= self.rent_due_day:
            return date(today.year, today.month, self.rent_due_day)
        else:
            if today.month == 12:
                return date(today.year + 1, 1, self.rent_due_day)
            else:
                next_month = today.month + 1
                last_day = calendar.monthrange(today.year, next_month)[1]
                return date(today.year, next_month, min(self.rent_due_day, last_day))

    @property
    def quit_notice_deadline(self) -> date | None:
        if self.quit_notice_date:
            return self.quit_notice_date
        if self.status == 'active':
            return self.end_date - timedelta(days=self.notice_period_days)
        return None

