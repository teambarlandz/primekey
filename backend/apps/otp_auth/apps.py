from django.apps import AppConfig
from django.db.models.signals import post_migrate


class OtpAuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.otp_auth"
    verbose_name = "OTP Authentication"

    def ready(self):
        post_migrate.connect(
            self._create_schedule,
            sender=self,
            dispatch_uid="otp_auth_create_schedule",
        )

    @staticmethod
    def _create_schedule(**kwargs):
        from django_q.models import Schedule

        Schedule.objects.update_or_create(
            func="apps.otp_auth.tasks.cleanup_expired_otps",
            defaults={
                "name": "Cleanup expired OTP codes",
                "schedule_type": Schedule.MINUTES,
                "minutes": 15,
                "repeats": -1,
            },
        )
