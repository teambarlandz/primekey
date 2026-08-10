"""
Background tasks for NDPR Compliance using django-q2.
"""
from django_q.tasks import async_task
from django.utils import timezone
from datetime import timedelta
import hashlib
import json


def compile_export_data(export_request_id: str):
    """
    Compile all user data for export request.
    """
    from apps.compliance.models import ExportRequest
    from apps.crm.models import ConciergeLead, ConsentLog as CRMConsentLog
    from apps.properties.models import Property, PropertyImage
    
    try:
        export_request = ExportRequest.objects.get(id=export_request_id)
    except ExportRequest.DoesNotExist:
        return
    
    try:
        data = {}
        records_count = 0
        
        # Find all leads by email or phone
        leads_query = Q()
        if export_request.email:
            leads_query |= Q(email__iexact=export_request.email)
        if export_request.phone:
            leads_query |= Q(phone=export_request.phone)
        
        leads = ConciergeLead.objects.filter(leads_query).prefetch_related(
            'consent_logs', 'score_breakdown', 'sla_alerts'
        )
        
        leads_data = []
        for lead in leads:
            lead_data = {
                'id': str(lead.id),
                'full_name': lead.full_name,
                'phone': lead.phone,
                'email': lead.email,
                'preferred_location': lead.preferred_location,
                'property_type': lead.property_type,
                'budget_min': lead.budget_min,
                'budget_max': lead.budget_max,
                'bedrooms': lead.bedrooms,
                'ndpr_consent': lead.ndpr_consent,
                'consent_timestamp': lead.consent_timestamp,
                'status': lead.status,
                'lead_score': lead.lead_score,
                'sla_deadline': lead.sla_deadline,
                'is_sla_breached': lead.is_sla_breached,
                'sla_remaining_minutes': lead.sla_remaining_minutes,
                'assigned_agent': lead.assigned_agent.username if lead.assigned_agent else None,
                'created_at': lead.created_at,
                'updated_at': lead.updated_at,
            }
            
            # Consent logs
            lead_data['consent_logs'] = [
                {
                    'id': str(cl.id),
                    'ip_address': cl.ip_address,
                    'user_agent': cl.user_agent,
                    'consent_text': cl.consent_text,
                    'created_at': cl.created_at,
                }
                for cl in lead.consent_logs.all()
            ]
            
            # Score breakdown
            if hasattr(lead, 'score_breakdown') and lead.score_breakdown:
                sb = lead.score_breakdown
                lead_data['score_breakdown'] = {
                    'budget_match': sb.budget_match_score,
                    'location_match': sb.location_match_score,
                    'property_type_match': sb.property_type_match_score,
                    'bedrooms_match': sb.bedrooms_match_score,
                    'completeness': sb.completeness_score,
                    'urgency': sb.urgency_score,
                    'total': sb.total_score,
                    'calculated_at': sb.calculated_at,
                }
            
            # SLA alerts
            lead_data['sla_alerts'] = [
                {
                    'severity': alert.severity,
                    'message': alert.message,
                    'acknowledged': alert.acknowledged,
                    'created_at': alert.created_at,
                }
                for alert in lead.sla_alerts.all()
            ]
            
            leads_data.append(lead_data)
            records_count += 1
        
        data['concierge_leads'] = leads_data
        
        # Find saved properties/favorites (if implemented)
        # TODO: Add when favorites model exists
        
        # Compliance consent logs (NDPR)
        consent_logs_query = Q()
        if export_request.email:
            consent_logs_query |= Q(email__iexact=export_request.email)
        if export_request.phone:
            consent_logs_query |= Q(phone=export_request.phone)
        
        consent_logs = CRMConsentLog.objects.filter(consent_logs_query)
        data['ndpr_consent_logs'] = [
            {
                'id': str(cl.id),
                'purpose': cl.purpose,
                'consent_given': cl.consent_given,
                'consent_text': cl.consent_text,
                'version': cl.version,
                'legal_basis': cl.legal_basis,
                'ip_address': cl.ip_address,
                'user_agent': cl.user_agent,
                'withdrawn': cl.withdrawn,
                'withdrawn_at': cl.withdrawn_at,
                'withdrawal_method': cl.withdrawal_method,
                'created_at': cl.created_at,
            }
            for cl in consent_logs
        ]
        records_count += consent_logs.count()
        
        # Generate JSON export
        export_json = json.dumps(data, indent=2, default=str)
        
        # Calculate hash for integrity
        data_hash = hashlib.sha256(export_json.encode()).hexdigest()
        
        # Persist the file outside MEDIA_ROOT so nginx never serves it directly.
        export_dir = settings.EXPORT_STORAGE_DIR
        export_dir.mkdir(parents=True, exist_ok=True)
        file_path = export_dir / f"{export_request.id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(export_json)
        
        export_request.records_count = records_count
        export_request.status = 'completed'
        export_request.completed_at = timezone.now()
        export_request.expires_at = timezone.now() + timedelta(days=7)
        export_request.download_url = f"/api/v1/compliance/export/download/{export_request.id}/"
        export_request.save(update_fields=[
            'records_count', 'status', 'completed_at', 'expires_at', 'download_url'
        ])
        
        return {
            'success': True,
            'records_count': records_count,
            'data_hash': data_hash,
        }
        
    except Exception as e:
        export_request.status = 'failed'
        export_request.errors = export_request.errors or []
        export_request.errors.append(str(e))
        export_request.save(update_fields=['status', 'errors'])
        return {'success': False, 'error': str(e)}


def process_erasure_request(erasure_request_id: str):
    """
    Process right to erasure / right to be forgotten.
    Anonymizes personal data while preserving analytical value.
    """
    from apps.compliance.models import ErasureRequest, AnonymizationLog
    from apps.crm.models import ConciergeLead, ConsentLog as CRMConsentLog
    from apps.properties.models import Property
    
    try:
        erasure_request = ErasureRequest.objects.get(id=erasure_request_id)
    except ErasureRequest.DoesNotExist:
        return
    
    try:
        erased_records = {}
        
        with transaction.atomic():
            # Find leads to anonymize
            leads_query = Q()
            if erasure_request.email:
                leads_query |= Q(email__iexact=erasure_request.email)
            if erasure_request.phone:
                leads_query |= Q(phone=erasure_request.phone)
            
            leads = ConciergeLead.objects.filter(leads_query)
            
            lead_count = 0
            for lead in leads:
                # Capture original data for hash
                original_data = {
                    'full_name': lead.full_name,
                    'phone': lead.phone,
                    'email': lead.email,
                    'preferred_location': lead.preferred_location,
                    'budget_min': lead.budget_min,
                    'budget_max': lead.budget_max,
                }
                original_hash = hashlib.sha256(
                    json.dumps(original_data, sort_keys=True).encode()
                ).hexdigest()
                
                # Fields to anonymize
                fields_anonymized = {}
                
                # Anonymize PII
                lead.full_name = f"Anon_{lead.id.hex[:8]}"
                lead.phone = f"anon_{lead.id.hex[:8]}@primekey.ng"
                lead.email = f"anon_{lead.id.hex[:8]}@primekey.ng"
                fields_anonymized = {
                    'full_name': True,
                    'phone': True,
                    'email': True,
                }
                
                # Keep analytical data but generalize
                if lead.preferred_location:
                    # Keep city/area but remove specific address
                    pass
                
                lead.save(update_fields=['full_name', 'phone', 'email', 'updated_at'])
                lead_count += 1
                
                # Log anonymization
                AnonymizationLog.objects.create(
                    lead_id=lead.id,
                    lead_phone=original_data['phone'],
                    lead_email=original_data['email'],
                    fields_anonymized=fields_anonymized,
                    original_data_hash=original_hash,
                    trigger='erasure_request',
                    triggered_by=None,
                    related_request_id=erasure_request.id,
                )
            
            erased_records['concierge_leads'] = lead_count
            
            # Anonymize CRM consent logs
            consent_logs_query = Q()
            if erasure_request.email:
                consent_logs_query |= Q(email__iexact=erasure_request.email)
            if erasure_request.phone:
                consent_logs_query |= Q(phone=erasure_request.phone)
            
            consent_logs = CRMConsentLog.objects.filter(consent_logs_query)
            consent_count = 0
            
            for cl in consent_logs:
                # Hash original
                orig = {'email': cl.email, 'phone': cl.phone}
                orig_hash = hashlib.sha256(
                    json.dumps(orig, sort_keys=True).encode()
                ).hexdigest()
                
                # Anonymize
                cl.email = f"anon_{cl.id.hex[:8]}@primekey.ng"
                cl.phone = f"anon_{cl.id.hex[:8]}"
                cl.save(update_fields=['email', 'phone'])
                
                AnonymizationLog.objects.create(
                    lead_id=cl.lead_id or uuid.uuid4(),
                    lead_phone=orig['phone'],
                    lead_email=orig['email'],
                    fields_anonymized={'email': True, 'phone': True},
                    original_data_hash=orig_hash,
                    trigger='erasure_request',
                    triggered_by=None,
                    related_request_id=erasure_request.id,
                )
                consent_count += 1
            
            erased_records['crm_consent_logs'] = consent_count
            
            # Update erasure request
            erasure_request.records_erased = erased_records
            erasure_request.status = 'completed'
            erasure_request.completed_at = timezone.now()
            erasure_request.save(update_fields=[
                'records_erased', 'status', 'completed_at'
            ])
            
        return {'success': True, 'erased': erased_records}
        
    except Exception as e:
        erasure_request.status = 'failed'
        erasure_request.errors = erasure_request.errors or []
        erasure_request.errors.append(str(e))
        erasure_request.save(update_fields=['status', 'errors'])
        return {'success': False, 'error': str(e)}


def scheduled_anonymization():
    """
    Scheduled task: Anonymize inactive leads older than 6 months.
    Runs via pg_cron / django-q2 scheduler.
    """
    from apps.compliance.models import AnonymizationLog
    from apps.crm.models import ConciergeLead, ConsentLog as CRMConsentLog
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff = timezone.now() - timedelta(days=180)
    
    # Find inactive leads with no activity for 6 months
    leads = ConciergeLead.objects.filter(
        created_at__lt=cutoff,
        status__in=['active_sla_queue', 'assigned', 'contacted']
    ).exclude(
        status__in=['closed_won', 'closed_lost', 'expired']
    )
    
    count = 0
    for lead in leads:
        original_data = {
            'full_name': lead.full_name,
            'phone': lead.phone,
            'email': lead.email,
        }
        original_hash = hashlib.sha256(
            json.dumps(original_data, sort_keys=True).encode()
        ).hexdigest()
        
        lead.full_name = f"Anon_{lead.id.hex[:8]}"
        lead.phone = f"anon_{lead.id.hex[:8]}@primekey.ng"
        lead.email = f"anon_{lead.id.hex[:8]}@primekey.ng"
        lead.save(update_fields=['full_name', 'phone', 'email', 'updated_at'])
        
        AnonymizationLog.objects.create(
            lead_id=lead.id,
            lead_phone=original_data['phone'],
            lead_email=original_data['email'],
            fields_anonymized={'full_name': True, 'phone': True, 'email': True},
            original_data_hash=original_hash,
            trigger='retention_policy',
            triggered_by=None,
        )
        count += 1
    
    # Also anonymize related consent logs
    if count > 0:
        CRMConsentLog.objects.filter(
            lead_id__in=[l.id for l in leads]
        ).update(
            email=models.F('id'),  # Will be overridden
            phone=models.F('id'),
        )
    
    return f"Anonymized {count} inactive leads"


def check_legal_holds():
    """
    Check for legal holds that prevent erasure.
    """
    # TODO: Implement legal hold checking
    pass