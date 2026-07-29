"""
Lead Scoring Service
Calculates lead quality scores based on matching criteria and completeness.
"""

from typing import Dict, Any
from .models import ConciergeLead, LeadScore


class LeadScoringService:
    """
    Scores leads 0-100 based on:
    - Budget match with available inventory (20 pts)
    - Location match with active listings (20 pts)
    - Property type match (15 pts)
    - Bedrooms match (15 pts)
    - Profile completeness (15 pts)
    - Urgency signals (15 pts)
    """
    
    MAX_SCORE = 100
    
    # Weight configuration
    WEIGHTS = {
        'budget_match': 20,
        'location_match': 20,
        'property_type_match': 15,
        'bedrooms_match': 15,
        'completeness': 15,
        'urgency': 15,
    }
    
    def __init__(self):
        from apps.properties.models import Property
        self.Property = Property
    
    def calculate_score(self, lead: ConciergeLead) -> LeadScore:
        """
        Calculate and persist lead score with breakdown.
        """
        scores = {
            'budget_match': self._score_budget_match(lead),
            'location_match': self._score_location_match(lead),
            'property_type_match': self._score_property_type_match(lead),
            'bedrooms_match': self._score_bedrooms_match(lead),
            'completeness': self._score_completeness(lead),
            'urgency': self._score_urgency(lead),
        }
        
        total = sum(scores.values())
        
        score_obj, created = LeadScore.objects.update_or_create(
            lead=lead,
            defaults={
                'budget_match_score': scores['budget_match'],
                'location_match_score': scores['location_match'],
                'property_type_match_score': scores['property_type_match'],
                'bedrooms_match_score': scores['bedrooms_match'],
                'completeness_score': scores['completeness'],
                'urgency_score': scores['urgency'],
                'total_score': total,
            }
        )
        
        # Update lead's cached score
        lead.lead_score = total
        lead.save(update_fields=['lead_score'])
        
        return score_obj
    
    def _score_budget_match(self, lead: ConciergeLead) -> int:
        """Score based on how many properties fall within budget range."""
        if lead.budget_min == 0 and lead.budget_max >= 500000000:
            return 10  # No specific budget = neutral
        
        matching_props = self.Property.objects.filter(
            status='available',
            price__gte=lead.budget_min,
            price__lte=lead.budget_max
        ).count()
        
        if matching_props == 0:
            return 0
        elif matching_props <= 2:
            return 5
        elif matching_props <= 5:
            return 12
        elif matching_props <= 10:
            return 16
        else:
            return 20
    
    def _score_location_match(self, lead: ConciergeLead) -> int:
        """Score based on property availability in preferred location."""
        if not lead.preferred_location:
            return 0
        
        matching_props = self.Property.objects.filter(
            status='available'
        ).filter(
            Q(city__icontains=lead.preferred_location) |
            Q(area__icontains=lead.preferred_location) |
            Q(state__icontains=lead.preferred_location)
        ).count()
        
        if matching_props == 0:
            return 0
        elif matching_props <= 3:
            return 8
        elif matching_props <= 8:
            return 14
        else:
            return 20
    
    def _score_property_type_match(self, lead: ConciergeLead) -> int:
        """Score based on property type availability."""
        if lead.property_type == 'any':
            return 10  # Neutral - any type acceptable
        
        matching_props = self.Property.objects.filter(
            status='available',
            property_type=lead.property_type
        ).count()
        
        if matching_props == 0:
            return 0
        elif matching_props <= 2:
            return 5
        elif matching_props <= 5:
            return 10
        else:
            return 15
    
    def _score_bedrooms_match(self, lead: ConciergeLead) -> int:
        """Score based on bedroom availability."""
        if lead.bedrooms == 'any':
            return 10  # Neutral
        
        target_beds = int(lead.bedrooms) if lead.bedrooms != '5' else 5
        
        if target_beds >= 5:
            matching_props = self.Property.objects.filter(
                status='available',
                bedrooms__gte=5
            ).count()
        else:
            matching_props = self.Property.objects.filter(
                status='available',
                bedrooms=target_beds
            ).count()
        
        if matching_props == 0:
            return 0
        elif matching_props <= 2:
            return 5
        elif matching_props <= 5:
            return 10
        else:
            return 15
    
    def _score_completeness(self, lead: ConciergeLead) -> int:
        """Score based on profile completeness."""
        score = 0
        
        # Required fields (always present if validated)
        score += 5  # full_name
        score += 5  # phone
        score += 5  # preferred_location
        
        # Optional but valuable
        if lead.email:
            score += 3
        if lead.property_type != 'any':
            score += 3
        if lead.bedrooms != 'any':
            score += 3
        if lead.budget_min > 0 or lead.budget_max < 500000000:
            score += 3
        
        return min(score, 15)
    
    def _score_urgency(self, lead: ConciergeLead) -> int:
        """Score based on urgency signals."""
        score = 10  # Base score
        
        # Tight budget range = more urgent
        budget_range = lead.budget_max - lead.budget_min
        if budget_range < 10000000:  # Less than 10M range
            score += 5
        
        # Specific location + specific type + specific beds = high intent
        if lead.preferred_location and lead.property_type != 'any' and lead.bedrooms != 'any':
            score += 5
        
        return min(score, 15)


from django.db.models import Q


class SLAAlertService:
    """
    Manages SLA breach alerts for concierge leads.
    """
    
    def check_sla_deadlines(self):
        """
        Check all active leads for SLA breaches and create alerts.
        Called by background worker (django-q2 cron).
        """
        # Leads in SLA queue or assigned but not yet contacted
        active_leads = ConciergeLead.objects.filter(
            status__in=['active_sla_queue', 'assigned']
        ).select_related('assigned_agent')
        
        alerts_created = 0
        
        for lead in active_leads:
            if lead.is_sla_breached:
                # Create critical breach alert
                self._create_alert(lead, 'critical', 
                    f"SLA BREACHED: Lead '{lead.full_name}' has been in queue for over 2 hours without contact.")
                alerts_created += 1
            elif lead.sla_remaining_minutes <= 30:
                # Create warning alert (30 min remaining)
                if not self._has_recent_warning(lead):
                    self._create_alert(lead, 'warning',
                        f"SLA WARNING: Lead '{lead.full_name}' has {lead.sla_remaining_minutes} minutes remaining before breach.")
                    alerts_created += 1
            elif lead.sla_remaining_minutes <= 60:
                # Create early warning (1 hour remaining)
                if not self._has_recent_warning(lead):
                    self._create_alert(lead, 'warning',
                        f"SLA APPROACHING: Lead '{lead.full_name}' has {lead.sla_remaining_minutes} minutes remaining.")
                    alerts_created += 1
        
        return alerts_created
    
    def _has_recent_warning(self, lead: ConciergeLead) -> bool:
        """Check if a warning alert was created in the last 15 minutes."""
        from .models import SLAAlert
        recent = timezone.now() - timedelta(minutes=15)
        return SLAAlert.objects.filter(
            lead=lead,
            severity='warning',
            created_at__gte=recent
        ).exists()
    
    def _create_alert(self, lead: ConciergeLead, severity: str, message: str):
        """Create an SLA alert."""
        from .models import SLAAlert
        SLAAlert.objects.create(
            lead=lead,
            severity=severity,
            message=message
        )
    
    def get_unacknowledged_alerts(self):
        """Get all unacknowledged alerts ordered by severity and time."""
        from .models import SLAAlert
        severity_order = {'critical': 0, 'breach': 1, 'warning': 2}
        alerts = SLAAlert.objects.filter(acknowledged=False).select_related('lead')
        return sorted(alerts, key=lambda a: (severity_order.get(a.severity, 3), a.created_at))
    
    def acknowledge_alert(self, alert_id, user):
        """Acknowledge an alert."""
        from .models import SLAAlert
        try:
            alert = SLAAlert.objects.get(pk=alert_id, acknowledged=False)
            alert.acknowledged = True
            alert.acknowledged_by = user
            alert.acknowledged_at = timezone.now()
            alert.save()
            return True
        except SLAAlert.DoesNotExist:
            return False


from django.utils import timezone
from datetime import timedelta