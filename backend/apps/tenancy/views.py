from datetime import timedelta
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.dashboard.models import AgentProfile, PropertyAgentAssignment
from apps.dashboard.permissions import IsAgent, IsManager
from apps.landlords.models import LandlordProfile
from apps.properties.models import Property
from apps.tenancy.models import Unit, Tenant, Lease
from apps.tenancy.serializers import (
    UnitSerializer, UnitDetailSerializer,
    TenantSerializer, TenantDetailSerializer,
    LeaseSerializer, LeaseDetailSerializer,
)

AGENT_PERMISSIONS = [IsAuthenticated, IsAgent]
MANAGER_PERMISSIONS = [IsAuthenticated, IsManager]


class UnitListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile).select_related('property')
        properties = [a.property for a in assignments]
        units = Unit.objects.filter(property__in=properties).select_related('property')
        serializer = UnitSerializer(units, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class UnitDetailView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request, pk):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile)
        properties = [a.property for a in assignments]
        unit = Unit.objects.select_related('property').get(pk=pk, property__in=properties)
        serializer = UnitDetailSerializer(unit)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class TenantListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile).select_related('property')
        properties = [a.property for a in assignments]
        units = Unit.objects.filter(property__in=properties)
        tenants = Tenant.objects.filter(unit__in=units).select_related('unit', 'unit__property')
        serializer = TenantSerializer(tenants, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class TenantDetailView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request, pk):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile)
        properties = [a.property for a in assignments]
        units = Unit.objects.filter(property__in=properties)
        tenant = Tenant.objects.select_related('unit', 'unit__property').get(pk=pk, unit__in=units)
        serializer = TenantDetailSerializer(tenant)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class LeaseListView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile).select_related('property')
        properties = [a.property for a in assignments]
        units = Unit.objects.filter(property__in=properties)
        leases = Lease.objects.filter(unit__in=units).select_related('unit', 'tenant', 'landlord', 'agent')
        serializer = LeaseSerializer(leases, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class LeaseDetailView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request, pk):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile)
        properties = [a.property for a in assignments]
        units = Unit.objects.filter(property__in=properties)
        lease = Lease.objects.select_related('unit', 'tenant', 'landlord', 'agent').get(pk=pk, unit__in=units)
        serializer = LeaseDetailSerializer(lease)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class LandlordTenancyDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Determine if user is a landlord or agent
        landlord = None
        is_agent = False
        try:
            landlord = LandlordProfile.objects.get(user=request.user)
        except LandlordProfile.DoesNotExist:
            try:
                agent = AgentProfile.objects.get(user=request.user, is_active=True)
                is_agent = True
            except AgentProfile.DoesNotExist:
                return Response(
                    {"success": False, "message": "Access denied. Landlord or agent account required."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if landlord:
            properties = Property.objects.filter(agent_assignments__landlord=landlord).distinct()
        else:
            assignments = PropertyAgentAssignment.objects.filter(agent=agent)
            properties = Property.objects.filter(agent_assignments__in=assignments).distinct()

        units = Unit.objects.filter(property__in=properties)
        leases = Lease.objects.filter(landlord=landlord).select_related('unit', 'tenant', 'agent') if landlord else Lease.objects.filter(unit__in=units).select_related('unit', 'tenant', 'landlord', 'agent')
        tenants = Tenant.objects.filter(unit__in=units)

        property_data = []
        for prop in properties:
            prop_units = units.filter(property=prop)
            prop_units_data = []
            for u in prop_units:
                tenant = u.tenant.first() if hasattr(u, 'tenant') else None
                lease = u.leases.first() if hasattr(u, 'leases') else None
                prop_units_data.append({
                    'unit_number': u.unit_number,
                    'unit_type': u.get_unit_type_display(),
                    'rent_amount': str(u.rent_amount),
                    'status': u.status,
                    'is_furnished': u.is_furnished,
                    'tenant': {
                        'full_name': tenant.full_name if tenant else None,
                        'phone': tenant.phone if tenant else None,
                        'is_verified': tenant.is_verified if tenant else None,
                    } if tenant else None,
                    'lease': {
                        'status': lease.status if lease else None,
                        'start_date': str(lease.start_date) if lease else None,
                        'end_date': str(lease.end_date) if lease else None,
                        'rent_amount': str(lease.rent_amount) if lease else None,
                        'rent_due_day': lease.rent_due_day if lease else None,
                        'quit_notice_date': str(lease.quit_notice_date) if lease else None,
                        'quit_notice_deadline': str(lease.quit_notice_deadline) if lease else None,
                        'next_rent_due': str(lease.next_rent_due) if lease else None,
                    } if lease else None,
                })
            property_data.append({
                'property_id': str(prop.id),
                'title': prop.title,
                'address': prop.address,
                'city': prop.city,
                'area': prop.area,
                'property_type': prop.get_property_type_display(),
                'purpose': prop.get_purpose_display(),
                'status': prop.status,
                'units': prop_units_data,
            })

        lease_data = LeaseSerializer(leases, many=True).data

        return Response({
            "success": True,
            "data": {
                "properties": property_data,
                "leases": lease_data,
                "total_units": units.count(),
                "occupied_units": units.filter(status='occupied').count(),
                "active_leases": leases.filter(status='active').count(),
                "quit_notice_pending": leases.filter(quit_notice_date__isnull=False).count(),
            },
        }, status=status.HTTP_200_OK)


class DashboardTenancySummaryView(APIView):
    permission_classes = AGENT_PERMISSIONS

    def get(self, request):
        agent_profile = request.user.agent_profile
        assignments = PropertyAgentAssignment.objects.filter(agent=agent_profile).select_related('property')
        properties = [a.property for a in assignments]
        units = Unit.objects.filter(property__in=properties)
        leases = Lease.objects.filter(unit__in=units).select_related('tenant')

        return Response({
            "success": True,
            "data": {
                "total_units": units.count(),
                "occupied_units": units.filter(status='occupied').count(),
                "available_units": units.filter(status='available').count(),
                "maintenance_units": units.filter(status='maintenance').count(),
                "total_tenants": Tenant.objects.filter(unit__in=units).count(),
                "active_leases": leases.filter(status='active').count(),
                "total_rent_revenue": str(leases.filter(status='active').aggregate(
                    total=Sum('rent_amount')
                )['total'] or 0),
                "quit_notice_pending": leases.filter(quit_notice_date__isnull=False).count(),
                "leases_expiring_30d": leases.filter(
                    status='active',
                    end_date__lte=timezone.localdate() + timedelta(days=30),
                    end_date__gte=timezone.localdate(),
                ).count(),
            },
        }, status=status.HTTP_200_OK)
