# -*- coding: utf-8 -*-
"""
Django management command to check SLA deadlines for concierge leads.
Run via cron (pg_cron) every 5 minutes: python manage.py check_sla_alerts
"""
from django.core.management.base import BaseCommand
from apps.crm.services import SLAAlertService


class Command(BaseCommand):
    help = 'Check SLA deadlines for active concierge leads and create alerts'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Print detailed output',
        )
    
    def handle(self, *args, **options):
        verbose = options.get('verbose', False)
        
        service = SLAAlertService()
        stats = service.check_all_leads()
        
        if verbose:
            self.stdout.write(
                f"SLA Check Complete: {stats['warnings']} warnings, "
                f"{stats['breaches']} breaches, {stats['criticals']} criticals"
            )
        
        # Always print summary for cron logs
        total = sum(stats.values())
        if total > 0:
            self.stdout.write(
                self.style.WARNING(
                    f"SLA Alerts Created: {stats['warnings']} warnings, "
                    f"{stats['breaches']} breaches, {stats['criticals']} criticals"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS("SLA Check Complete: No new alerts")
            )