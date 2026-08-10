import uuid

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
