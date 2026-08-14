import uuid
from django.db import models


class ContactMessage(models.Model):
    """Persisted contact form submission. Agents can view these in the dashboard."""

    SUBJECT_CHOICES = [
        ("general", "General Inquiry"),
        ("sales", "Sales & Property Inquiry"),
        ("support", "Technical Support"),
        ("landlord", "Landlord Registration"),
        ("partnership", "Partnership & BD"),
        ("legal", "Legal & Compliance"),
        ("other", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    subject = models.CharField(max_length=30, choices=SUBJECT_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "contact_messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_subject_display()}] {self.full_name} <{self.email}>"
