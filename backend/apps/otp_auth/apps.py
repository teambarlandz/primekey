from django.apps import AppConfig


class OtpAuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.otp_auth"
    verbose_name = "OTP Authentication"

    def ready(self):
        # Avoid DB access during migrate/check when tables may not exist.
        # Schedule is created lazily; failures are non-fatal (will retry next ready).
        try:
            from django.db.utils import OperationalError, ProgrammingError

            from django_q.models import Schedule

            # Purge expired / used OTPs every 15 minutes.
            Schedule.objects.update_or_create(
                func="apps.otp_auth.tasks.cleanup_expired_otps",
                defaults={
                    "name": "Cleanup expired OTP codes",
                    "schedule_type": Schedule.MINUTES,
                    "minutes": 15,
                    "repeats": -1,  # forever
                },
            )
        except (OperationalError, ProgrammingError):
            # Table not yet migrated (e.g. `manage.py check` on fresh DB) — ignore.
            pass
        except Exception:
            # Never block app startup on schedule creation.
            pass
