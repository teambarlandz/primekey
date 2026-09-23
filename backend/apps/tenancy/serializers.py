from rest_framework import serializers
from .models import Unit, Tenant, Lease


class UnitSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_address = serializers.CharField(source='property.address', read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True, allow_null=True)
    lease_status = serializers.CharField(source='leases.first().status', read_only=True, allow_null=True)

    class Meta:
        model = Unit
        fields = [
            'id', 'property', 'property_title', 'property_address',
            'unit_number', 'unit_type', 'bedrooms', 'bathrooms',
            'rent_amount', 'status', 'is_furnished', 'description',
            'tenant_name', 'lease_status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UnitDetailSerializer(UnitSerializer):
    tenant = serializers.CharField(source='tenant.full_name', read_only=True, allow_null=True)
    lease_status = serializers.CharField(source='leases.first().status', read_only=True, allow_null=True)

    class Meta(UnitSerializer.Meta):
        pass


class TenantSerializer(serializers.ModelSerializer):
    unit_number = serializers.CharField(source='unit.unit_number', read_only=True)
    property_title = serializers.CharField(source='unit.property.title', read_only=True)
    lease_status = serializers.CharField(source='lease.status', read_only=True, allow_null=True)

    class Meta:
        model = Tenant
        fields = [
            'id', 'unit', 'unit_number', 'property_title',
            'full_name', 'phone', 'email', 'id_type', 'id_number',
            'is_verified', 'lease_status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantDetailSerializer(TenantSerializer):
    lease_start_date = serializers.DateField(source='lease.start_date', read_only=True)
    lease_end_date = serializers.DateField(source='lease.end_date', read_only=True)
    rent_amount = serializers.DecimalField(source='lease.rent_amount', max_digits=12, decimal_places=2, read_only=True)
    rent_due_day = serializers.IntegerField(source='lease.rent_due_day', read_only=True)
    quit_notice_date = serializers.DateField(source='lease.quit_notice_date', read_only=True)
    next_rent_due = serializers.DateField(source='lease.next_rent_due', read_only=True)

    class Meta(TenantSerializer.Meta):
        fields = TenantSerializer.Meta.fields + [
            'lease_start_date', 'lease_end_date', 'rent_amount',
            'rent_due_day', 'quit_notice_date', 'next_rent_due',
        ]


class LeaseSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='unit.property.title', read_only=True)
    unit_number = serializers.CharField(source='unit.unit_number', read_only=True)
    landlord_name = serializers.CharField(source='landlord.full_name', read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    agent_name = serializers.CharField(source='agent.full_name', read_only=True, allow_null=True)
    next_rent_due = serializers.DateField(read_only=True)
    quit_notice_deadline = serializers.DateField(read_only=True)

    class Meta:
        model = Lease
        fields = [
            'id', 'unit', 'unit_number', 'property_title',
            'tenant', 'tenant_name', 'landlord', 'landlord_name',
            'agent', 'agent_name',
            'start_date', 'end_date', 'rent_amount', 'rent_due_day',
            'rent_frequency', 'status', 'quit_notice_date',
            'quit_notice_reason', 'notice_period_days', 'ndpr_consent',
            'next_rent_due', 'quit_notice_deadline',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaseDetailSerializer(LeaseSerializer):
    class Meta(LeaseSerializer.Meta):
        pass
