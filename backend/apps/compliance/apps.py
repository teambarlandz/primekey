from django.apps import AppConfig
from django.db.models.signals import post_migrate


class ComplianceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.compliance"
    verbose_name = "NDPR Compliance"

    def ready(self):
        post_migrate.connect(
            self._create_schedules,
            sender=self,
            dispatch_uid="compliance_create_schedules",
        )

    @staticmethod
    def _create_schedules(**kwargs):
        from django_q.models import Schedule

        # Export payloads are personal data held for a 7-day download window.
        # Without this they would sit in Postgres indefinitely, including in
        # every database backup.
        Schedule.objects.update_or_create(
            func="apps.compliance.tasks.purge_expired_exports",
            defaults={
                "name": "Purge expired NDPR export payloads",
                "schedule_type": Schedule.HOURLY,
                "minutes": 6,
                "repeats": -1,
            },
        )
