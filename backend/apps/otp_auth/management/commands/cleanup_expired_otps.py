"""Delete expired and used OTP codes to reduce attack surface.

Designed to run periodically via Django-Q2 or cron:
  python manage.py cleanup_expired_otps

Suggested schedule: every 15 minutes.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.otp_auth.models import OTPCode


class Command(BaseCommand):
    help = "Purge expired and already-used OTP codes from the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--older-than",
            type=int,
            default=0,
            help="Also delete records created more than N minutes ago (default: 0 = only expired/used).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without actually deleting.",
        )

    def handle(self, *args, **options):
        now = timezone.now()
        older_than = options["older_than"]
        dry_run = options["dry_run"]

        # Always target expired and used codes
        qs = OTPCode.objects.filter(used=True) | OTPCode.objects.filter(expires_at__lt=now)

        # Optionally also purge old records regardless of status
        if older_than:
            cutoff = now - timezone.timedelta(minutes=older_than)
            qs = qs | OTPCode.objects.filter(created_at__lt=cutoff)

        count = qs.distinct().count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"DRY RUN — would delete {count} OTP record(s).")
            )
            return

        # Use a single query to avoid N+1
        _deleted, deleted_count = qs.distinct().delete()

        self.stdout.write(
            self.style.SUCCESS(f"Cleaned up {deleted_count} expired/used OTP record(s).")
        )
