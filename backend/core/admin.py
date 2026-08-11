"""Admin dashboard context for the Unfold admin index page."""

import json

from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.db.models import Count, Sum
from django.urls import reverse
from unfold.admin import ModelAdmin

from apps.compliance.models import ErasureRequest, ExportRequest
from apps.crm.models import ConciergeLead, LeadScore, SLAAlert
from apps.landlords.models import Appointment, DocumentVault, LandlordProfile, PropertyIntake
from apps.properties.models import Property


def _kpi(title, metric, link=None, footer=None, color="primary"):
    return {
        "title": title,
        "metric": metric,
        "link": link,
        "footer": footer,
        "color": color,
    }


def dashboard_callback(request, context):
    """Populate KPI cards and charts for the admin index page."""

    # ── KPI metrics ──────────────────────────────────────────────────────
    total_properties = Property.objects.count()
    active_properties = Property.objects.filter(status="available").count()
    total_leads = ConciergeLead.objects.count()
    open_leads = ConciergeLead.objects.exclude(status__startswith="closed").exclude(
        status__startswith="erased"
    ).count()
    critical_sla = SLAAlert.objects.filter(severity="critical", acknowledged=False).count()
    landlords = LandlordProfile.objects.count()
    pending_landlords = LandlordProfile.objects.filter(verification_status="pending").count()
    pending_intakes = PropertyIntake.objects.filter(status="submitted").count()
    pending_docs = DocumentVault.objects.filter(review_status="pending").count()
    open_requests = (
        ExportRequest.objects.filter(status__in=["pending", "verified", "processing"]).count()
        + ErasureRequest.objects.filter(status__in=["pending", "verified", "processing"]).count()
    )
    upcoming_appointments = Appointment.objects.filter(status="pending").count()

    context["kpi"] = [
        _kpi(
            "Properties",
            total_properties,
            link=reverse("admin:properties_property_changelist"),
            footer=f"{active_properties} active",
            color="primary",
        ),
        _kpi(
            "Concierge Leads",
            total_leads,
            link=reverse("admin:crm_conciergelead_changelist"),
            footer=f"{open_leads} open",
            color="info",
        ),
        _kpi(
            "Critical SLA Alerts",
            critical_sla,
            link=reverse("admin:crm_slaalert_changelist"),
            footer="unacknowledged",
            color="danger",
        ),
        _kpi(
            "Landlords",
            landlords,
            link=reverse("admin:landlords_landlordprofile_changelist"),
            footer=f"{pending_landlords} pending verification",
            color="success",
        ),
        _kpi(
            "Pending Intakes",
            pending_intakes,
            link=reverse("admin:landlords_propertyintake_changelist"),
            footer=f"{pending_docs} docs to review",
            color="warning",
        ),
        _kpi(
            "Data Requests",
            open_requests,
            link=reverse("admin:compliance_exportrequest_changelist"),
            footer="exports + erasures",
            color="neutral",
        ),
    ]

    # ── Charts ───────────────────────────────────────────────────────────

    # Properties by purpose
    purpose_counts = {
        p["purpose"]: p["count"]
        for p in Property.objects.values("purpose").annotate(count=Count("id"))
    }
    purpose_labels = {
        "sale": "For Sale",
        "rent": "For Rent",
        "short_let": "Short Let",
    }
    context["chart_properties_purpose"] = {
        "title": "Properties by Purpose",
        "data": {
            "labels": [purpose_labels.get(k, k) for k in purpose_counts],
            "datasets": [
                {
                    "label": "Properties",
                    "data": list(purpose_counts.values()),
                    "backgroundColor": [
                        "var(--color-primary-base)",
                        "var(--color-primary-500)",
                        "var(--color-primary-300)",
                    ],
                }
            ],
        },
        "type": "doughnut",
    }

    # Properties by status
    status_counts = {
        s["status"]: s["count"]
        for s in Property.objects.values("status").annotate(count=Count("id"))
    }
    status_labels = {
        "available": "Available",
        "under_contract": "Under Contract",
        "rented": "Rented",
        "sold": "Sold",
    }
    context["chart_properties_status"] = {
        "title": "Properties by Status",
        "data": {
            "labels": [status_labels.get(k, k) for k in status_counts],
            "datasets": [
                {
                    "label": "Properties",
                    "data": list(status_counts.values()),
                    "backgroundColor": [
                        "var(--color-success-base)",
                        "var(--color-warning-base)",
                        "var(--color-info-base)",
                        "var(--color-danger-base)",
                    ],
                }
            ],
        },
        "type": "bar",
    }

    # Leads by status
    lead_status_counts = {
        s["status"]: s["count"]
        for s in ConciergeLead.objects.values("status").annotate(count=Count("id"))
    }
    lead_status_labels = dict(ConciergeLead.STATUS_CHOICES)
    context["chart_leads_status"] = {
        "title": "Concierge Leads by Status",
        "data": {
            "labels": [lead_status_labels.get(k, k) for k in lead_status_counts],
            "datasets": [
                {
                    "label": "Leads",
                    "data": list(lead_status_counts.values()),
                    "backgroundColor": "var(--color-info-base)",
                }
            ],
        },
        "type": "bar",
    }

    # Lead tier breakdown
    tier_counts = {
        t["tier"]: t["count"]
        for t in LeadScore.objects.values("tier").annotate(count=Count("id"))
    }
    tier_labels = dict(LeadScore.TIER_CHOICES)
    tier_colors = {
        "HOT": "var(--color-danger-base)",
        "WARM": "var(--color-warning-base)",
        "COLD": "var(--color-info-base)",
    }
    context["chart_lead_tiers"] = {
        "title": "Lead Priority Tiers",
        "data": {
            "labels": [tier_labels.get(k, k) for k in tier_counts],
            "datasets": [
                {
                    "label": "Leads",
                    "data": list(tier_counts.values()),
                    "backgroundColor": [tier_colors.get(k, "var(--color-primary-base)") for k in tier_counts],
                }
            ],
        },
        "type": "doughnut",
    }

    # Pipeline value
    pipeline_value = Property.objects.filter(
        status__in=["available", "under_contract"]
    ).aggregate(total=Sum("price"))["total"] or 0
    context["pipeline_value"] = f"{int(pipeline_value):,}"

    # Serialize chart payloads to JSON strings (Unfold chart components
    # expect `data` to be a JSON string via `data-value="{{ data }}"`).
    for key in list(context):
        if key.startswith("chart_"):
            context[key]["data"] = json.dumps(context[key]["data"])

    return context


# ---------------------------------------------------------------------------
# LogEntry admin — read-only, visible only to admin (superuser) and CEO
# ---------------------------------------------------------------------------

@admin.register(LogEntry)
class LogEntryAdmin(ModelAdmin):
    """Read-only audit log.  Only the superuser (admin) and members of the
    CEO group can view these records.  No one can add, change, or delete
    log entries — they are an immutable audit trail.
    """

    readonly_fields = (
        "action_time",
        "user",
        "content_type",
        "object_id",
        "object_repr",
        "action_flag",
        "action_message",
    )
    list_display = ("action_time", "user", "content_type", "object_repr", "action_flag_display")
    list_filter = ("action_flag", "content_type", "user")
    search_fields = ("object_repr", "action_message")
    list_filter_submit = True
    save_on_top = True
    ordering = ("-action_time",)

    def action_flag_display(self, obj):
        flags = {1: "Add", 2: "Change", 3: "Delete"}
        return flags.get(obj.action_flag, "Unknown")

    action_flag_display.short_description = "Action"

    # -- Module-level permission gate (R4) -----------------------------------

    def has_module_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="CEO").exists()

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="CEO").exists()

    # Logs are immutable — no one can create, edit, or delete them.

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
