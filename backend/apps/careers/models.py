import uuid

from django.conf import settings
from django.db import models


class JobOpening(models.Model):
    """
    Public job openings surfaced on the careers page.

    Only ``is_active`` openings are exposed through the public API.
    """

    EMPLOYMENT_TYPE_CHOICES = [
        ("full_time", "Full-time"),
        ("part_time", "Part-time"),
        ("contract", "Contract"),
        ("internship", "Internship"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    team = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        default="full_time",
        verbose_name="Employment Type",
    )
    summary = models.TextField(blank=True)
    application_email = models.EmailField(
        default="careers@primekeyhomes.com",
        verbose_name="Application Email",
    )
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "careers_job_openings"
        verbose_name = "Job Opening"
        verbose_name_plural = "Job Openings"
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"{self.title} ({self.team})"


class JobApplication(models.Model):
    """
    Applicant submissions for a specific job opening.

    Stores recruitment details securely. NDPR consent is mandatory.
    Resumes are stored in protected storage, not served publicly.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("reviewed", "Reviewed"),
        ("shortlisted", "Shortlisted"),
        ("rejected", "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_opening = models.ForeignKey(
        JobOpening,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, default="")
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    cover_letter = models.TextField(blank=True, default="")
    resume = models.FileField(
        upload_to="career_resumes/%Y/%m/",
        max_length=500,
    )
    ndpr_consent = models.BooleanField(
        default=False,
        verbose_name="NDPR Consent",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "careers_job_applications"
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} — {self.job_opening.title}"

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return " ".join(p for p in parts if p).strip()
