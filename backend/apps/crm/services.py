from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django.db import models
from .models import ConciergeLead, ConsentLog, LeadScore, SLAAlert


class LeadScoringService:
    """
    Automatically calculates lead priority scores based on financial capacity,
    contact completeness, and target location demand, then persists them
    for reporting, SLA prioritization, and NDPR data export.
    """

    HIGH_DEMAND_LOCATIONS = ['lekki phase 1', 'ikoyi', 'vi', 'victoria island', 'maitama', 'asokoro', 'ikeja gra']

    @classmethod
    def calculate_score(cls, lead: ConciergeLead) -> dict:
        score = 0
        breakdown = {}

        # 1. Budget Weighting (Max 40 points)
        budget = lead.budget_max or 0
        if budget >= 200000000:  # 200M+ NGN
            budget_pts = 40
        elif budget >= 80000000:   # 80M+ NGN
            budget_pts = 25
        else:
            budget_pts = 10
        score += budget_pts
        breakdown['budget_match_score'] = budget_pts

        # 2. Contact Completeness (Max 30 points)
        contact_pts = 0
        if lead.phone:
            contact_pts += 15
        if lead.email:
            contact_pts += 15
        score += contact_pts
        breakdown['completeness_score'] = contact_pts

        # 3. Location Desirability (Max 30 points)
        location_pts = 10
        loc_clean = (lead.preferred_location or '').lower().strip()
        if any(hot_spot in loc_clean for hot_spot in cls.HIGH_DEMAND_LOCATIONS):
            location_pts = 30
        score += location_pts
        breakdown['location_match_score'] = location_pts

        # 4. Property type specificity (Max 10 points)
        type_pts = 10 if lead.property_type and lead.property_type != 'any' else 5
        score += type_pts
        breakdown['property_type_match_score'] = type_pts

        # 5. Bedroom specificity (Max 10 points)
        bedrooms_pts = 10 if lead.bedrooms and lead.bedrooms != 'any' else 5
        score += bedrooms_pts
        breakdown['bedrooms_match_score'] = bedrooms_pts

        # 6. Urgency proxy: newer leads score higher (Max 10 points)
        urgency_pts = 10
        age_minutes = (timezone.now() - lead.created_at).total_seconds() / 60 if lead.created_at else 0
        if age_minutes > 60:
            urgency_pts = 5
        score += urgency_pts
        breakdown['urgency_score'] = urgency_pts

        # Determine Tier
        if score >= 75:
            tier = 'HOT'
        elif score >= 45:
            tier = 'WARM'
        else:
            tier = 'COLD'

        return {
            'score': score,
            'tier': tier,
            'breakdown': breakdown,
        }

    @classmethod
    def persist_score(cls, lead: ConciergeLead) -> LeadScore:
        result = cls.calculate_score(lead)
        score_obj, _ = LeadScore.objects.update_or_create(
            lead=lead,
            defaults={
                **result['breakdown'],
                'total_score': result['score'],
                'tier': result['tier'],
            },
        )
        return score_obj

    @classmethod
    def if_needed_score_lead(cls, lead: ConciergeLead) -> dict:
        result = cls.calculate_score(lead)
        cls.persist_score(lead)
        return {
            'score': result['score'],
            'tier': result['tier'],
            'breakdown': result['breakdown'],
        }


class SLAAlertService:
    """
    Monitors 2-hour response SLAs and flags overdue unassigned leads.
    Creates SLAAlert records and notifies the agent queue on breach.
    """

    SLA_HOURS = 2

    @classmethod
    def check_overdue_leads(cls) -> list[dict]:
        sla_threshold = timezone.now() - timedelta(hours=cls.SLA_HOURS)

        overdue_leads = ConciergeLead.objects.filter(
            status='active_sla_queue',
            sla_deadline__lte=sla_threshold,
            sla_breached_at__isnull=True,
        )

        breached = []
        for lead in overdue_leads:
            lead.sla_breached_at = timezone.now()
            lead.save(update_fields=['sla_breached_at', 'updated_at'])

            alert, _ = SLAAlert.objects.get_or_create(
                lead=lead,
                severity='critical',
                defaults={
                    'message': (
                        f"Lead {lead.full_name} ({lead.phone}) has exceeded the "
                        f"{cls.SLA_HOURS}-hour response SLA and is awaiting assignment."
                    ),
                },
            )

            # Notify the agent queue
            from apps.notifications.services import create_notification
            create_notification(
                "agent",
                None,
                "SLA breach — lead needs attention",
                alert.message,
            )

            breached.append({
                'id': str(lead.id),
                'full_name': lead.full_name,
                'phone': lead.phone,
                'tier': getattr(lead.score_breakdown, 'tier', None) if hasattr(lead, 'score_breakdown') else None,
                'message': alert.message,
            })

        return breached


class NDPRErasureService:
    """
    Service handling Nigeria Data Protection Act (NDPA/NDPR) data erasure
    requests ("Right to be Forgotten").
    """

    @classmethod
    def process_erasure_request(cls, identifier: str, ip_address: str = None, user_agent: str = None) -> dict:
        clean_id = identifier.strip()

        leads = ConciergeLead.objects.filter(
            models.Q(phone=clean_id) | models.Q(email__iexact=clean_id)
        )

        count = leads.count()

        if count == 0:
            return {
                "success": False,
                "message": "No active lead records found matching the provided contact details.",
                "records_erased": 0
            }

        for lead in leads:
            # 1. Log statutory audit record
            ConsentLog.objects.create(
                lead=lead,
                phone=lead.phone,
                email=lead.email,
                action='ERASURE_COMPLETED',
                ip_address=ip_address,
                user_agent=user_agent,
                notes=f"Data erased per NDPR Right to be Forgotten request for Lead ID: {lead.id}"
            )

            # 2. Anonymize PII
            lead.full_name = "[DELETED PER NDPR]"
            lead.phone = f"ANON_{lead.id.hex[:8]}"
            lead.email = None
            lead.status = 'erased_ndpr'
            lead.save()

        return {
            "success": True,
            "message": f"Successfully processed NDPR erasure request. {count} lead record(s) anonymized.",
            "records_erased": count
        }
