import uuid
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models

# Sensitive landlord documents (IDs, proof of ownership) live OUTSIDE
# MEDIA_ROOT in protected storage and are served only via the authenticated
# download endpoint. base_url=None guarantees no public URL is ever exposed.
# Custom storage avoids hardcoding absolute paths in migrations (portable across
# Windows/Linux CI). Location is resolved at runtime from settings.
class ProtectedStorage(FileSystemStorage):
    def deconstruct(self):
        # Don't serialize the absolute location; it is resolved from settings at runtime.
        return ("apps.landlords.models.ProtectedStorage", [], {})

    def __init__(self, *args, **kwargs):
        kwargs["location"] = settings.PROTECTED_STORAGE_DIR
        kwargs["base_url"] = None
        super().__init__(*args, **kwargs)


protected_storage = ProtectedStorage()


from core.files import _ALLOWED_SIGNATURES

_SAFE_EXTENSIONS = {
    ext for exts, _ in _ALLOWED_SIGNATURES.values() for ext in exts
}


def document_upload_path(instance, filename):
    """Randomize the stored filename; unknown extensions fall back to 'bin'."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in _SAFE_EXTENSIONS:
        ext = "bin"
    return f"landlord_documents/{uuid.uuid4().hex}.{ext}"


class LandlordProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="landlord_profiles", help_text="Django auth user linked via OTP login."
    )
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


class DocumentVault(models.Model):
    DOC_TYPES = [
        ('title_deed', 'Title Deed'),
        ('certificate_of_occupancy', "Certificate of Occupancy"),
        ('proof_of_ownership', 'Proof of Ownership'),
        ('government_id', 'Government-issued ID'),
        ('land_receipt', 'Land Receipt / Agreement'),
        ('other', 'Other'),
    ]

    REVIEW_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    landlord = models.ForeignKey(
        LandlordProfile, on_delete=models.CASCADE, related_name='documents'
    )
    intake = models.ForeignKey(
        PropertyIntake,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
    )
    doc_type = models.CharField(max_length=40, choices=DOC_TYPES, default='title_deed')
    file = models.FileField(
        upload_to=document_upload_path,
        storage=protected_storage,
    )
    review_status = models.CharField(
        max_length=20, choices=REVIEW_STATUS, default='pending', db_index=True
    )
    review_notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Document Vault Entry"
        verbose_name_plural = "Document Vault Entries"

    def __str__(self):
        return f"{self.get_doc_type_display()} - {self.landlord.full_name}"
