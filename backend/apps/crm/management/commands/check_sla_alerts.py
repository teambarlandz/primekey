from django.core.management.base import BaseCommand

from apps.crm.services import SLAAlertService


class Command(BaseCommand):
    help = "Detect concierge leads that breached the 2-hour SLA and raise alerts."

    def handle(self, *args, **options):
        breached = SLAAlertService.check_overdue_leads()
        self.stdout.write(
            self.style.SUCCESS(f"Checked SLA queue. {len(breached)} lead(s) breached.")
        )
