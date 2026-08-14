import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.utils.html import strip_tags
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import ContactMessage
from .serializers import ContactMessageCreateSerializer

logger = logging.getLogger(__name__)

SUBJECT_LABELS = dict(ContactMessage.SUBJECT_CHOICES)


@method_decorator(ratelimit(key="ip", rate="5/m", method="POST"), name="post")
class ContactFormView(APIView):
    """
    POST /api/v1/contact/
    Receives the contact form, persists it, and sends an email to the team.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "message": "Validation failed.", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        contact = serializer.save()
        subject_label = SUBJECT_LABELS.get(contact.subject, contact.subject)

        # Build email
        email_subject = f"[Primekey] {subject_label}"
        email_body = (
            f"New contact form submission\n\n"
            f"Name: {contact.full_name}\n"
            f"Email: {contact.email}\n"
            f"Phone: {contact.phone}\n"
            f"Subject: {subject_label}\n\n"
            f"Message:\n{contact.message}\n"
        )
        html_body = (
            f"<h2>New Contact Form Submission</h2>"
            f"<table style='border-collapse:collapse;'>"
            f"<tr><td style='padding:4px 12px;font-weight:bold;'>Name</td><td style='padding:4px 12px;'>{contact.full_name}</td></tr>"
            f"<tr><td style='padding:4px 12px;font-weight:bold;'>Email</td><td style='padding:4px 12px;'>{contact.email}</td></tr>"
            f"<tr><td style='padding:4px 12px;font-weight:bold;'>Phone</td><td style='padding:4px 12px;'>{contact.phone}</td></tr>"
            f"<tr><td style='padding:4px 12px;font-weight:bold;'>Subject</td><td style='padding:4px 12px;'>{subject_label}</td></tr>"
            f"</table>"
            f"<p style='margin-top:16px;white-space:pre-wrap;'>{contact.message}</p>"
        )

        try:
            send_mail(
                subject=email_subject,
                message=email_body,
                html_message=html_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_RECIPIENT_EMAIL],
                fail_silently=False,
            )
            logger.info(f"Contact email sent from {contact.email} (subject={contact.subject})")
        except Exception:
            logger.exception("Failed to send contact form email")

        return Response(
            {
                "success": True,
                "message": "Your message has been sent. We'll get back to you within 24 hours.",
            },
            status=status.HTTP_201_CREATED,
        )
