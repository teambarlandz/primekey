"""
Background tasks for CRM lead scoring & SLA alerting using django-q2.
"""


def check_sla_alerts():
    """
    Scheduled task: detect concierge leads that have breached the 2-hour
    response SLA and raise agent notifications + SLAAlert records.
    """
    from apps.crm.services import SLAAlertService

    breached = SLAAlertService.check_overdue_leads()
    return {"breached_count": len(breached)}
