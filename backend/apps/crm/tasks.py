"""
Background tasks for CRM using django-q2.
These tasks are queued and processed by the Q cluster.
"""
from django_q.tasks import async_task, schedule
from django_q.models import Schedule
from datetime import timedelta


def check_sla_alerts_task():
    """
    Task to check SLA alerts - can be scheduled or run manually.
    """
    from apps.crm.services import SLAAlertService
    service = SLAAlertService()
    return service.check_all_leads()


def schedule_sla_checks():
    """
    Schedule periodic SLA checks (every 5 minutes).
    Run once during deployment/setup.
    """
    schedule(
        'apps.crm.tasks.check_sla_alerts_task',
        schedule_type=Schedule.MINUTES,
        minutes=5,
        name='SLA Alert Check (every 5 min)',
        repeats=-1  # Indefinite
    )


def send_lead_assignment_notification(lead_id: str):
    """
    Send notification when a lead is assigned to an agent.
    """
    from apps.crm.models import ConciergeLead
    try:
        lead = ConciergeLead.objects.get(id=lead_id)
        if lead.assigned_agent and lead.assigned_agent.email:
            # TODO: Implement email/SMS notification
            # send_mail(
            #     subject=f'New Lead Assigned: {lead.full_name}',
            #     message=f'Lead {lead.full_name} ({lead.phone}) assigned to you.',
            #     from_email=None,
            #     recipient_list=[lead.assigned_agent.email]
            # )
            return f"Notification queued for agent {lead.assigned_agent.email}"
    except ConciergeLead.DoesNotExist:
        return f"Lead {lead_id} not found"
    return "No notification sent"


def send_sla_breach_escalation(lead_id: str):
    """
    Escalate SLA breach to management.
    """
    from apps.crm.models import ConciergeLead
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    try:
        lead = ConciergeLead.objects.get(id=lead_id)
        managers = User.objects.filter(is_staff=True, is_active=True).exclude(email='')
        
        if managers.exists():
            # TODO: Implement email notification
            # send_mail(
            #     subject=f'SLA BREACH ESCALATION: {lead.full_name}',
            #     message=f'Lead {lead.full_name} ({lead.phone}) has breached 2-hour SLA.',
            #     from_email=None,
            #     recipient_list=[u.email for u in managers]
            # )
            return f"Escalation sent to {managers.count()} managers"
    except ConciergeLead.DoesNotExist:
        return f"Lead {lead_id} not found"
    
    return "No managers to notify"


def recalculate_lead_scores():
    """
    Periodic task to recalculate all lead scores.
    """
    from apps.crm.models import ConciergeLead
    from apps.crm.services import LeadScoringService
    
    service = LeadScoringService()
    leads = ConciergeLead.objects.filter(status__in=['active_sla_queue', 'assigned'])
    
    count = 0
    for lead in leads:
        service.calculate_score(lead)
        count += 1
    
    return f"Recalculated scores for {count} leads"