from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

from apps.landlords.models import LandlordProfile
from apps.dashboard.models import AgentProfile, PropertyAgentAssignment
from apps.properties.models import Property
from apps.tenancy.models import Unit, Tenant, Lease


User = get_user_model()


def create_user(phone, is_staff=False, is_superuser=False):
    user, created = User.objects.get_or_create(
        username=phone,
        defaults={
            'is_active': True,
            'is_staff': is_staff,
            'is_superuser': is_superuser,
        },
    )
    if created:
        user.set_unusable_password()
        user.save()
        print(f"  Created user: {phone}")
    else:
        print(f"  User exists: {phone}")
    return user


def create_landlord(user, full_name, id_type='nin', id_number='LK000001'):
    profile, created = LandlordProfile.objects.get_or_create(
        user=user,
        defaults={
            'full_name': full_name,
            'phone': user.username,
            'email': f"{full_name.lower().replace(' ', '.')}@primekey.com",
            'id_type': id_type,
            'id_number': id_number,
            'property_count': 2,
            'verification_status': 'approved',
            'ndpr_consent': True,
        },
    )
    if created:
        print(f"  Created landlord profile: {full_name}")
    return profile


def create_agent(user, full_name, role='agent', phone=None):
    if not phone:
        phone = user.username
    profile, created = AgentProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': role,
            'phone': phone,
            'full_name': full_name,
            'is_active': True,
        },
    )
    if created:
        print(f"  Created agent profile: {full_name} ({role})")
    return profile


def create_units_for_property(property):
    unit_types = ['self_contain', 'flat', 'single_room', 'studio']
    units_data = [
        {
            'unit_number': 'A1',
            'unit_type': 'flat',
            'bedrooms': 2,
            'bathrooms': 1,
            'rent_amount': '500000',
            'is_furnished': True,
            'status': 'occupied',
        },
        {
            'unit_number': 'A2',
            'unit_type': 'self_contain',
            'bedrooms': 1,
            'bathrooms': 1,
            'rent_amount': '350000',
            'is_furnished': True,
            'status': 'occupied',
        },
        {
            'unit_number': 'B1',
            'unit_type': 'flat',
            'bedrooms': 3,
            'bathrooms': 2,
            'rent_amount': '750000',
            'is_furnished': False,
            'status': 'available',
        },
    ]
    units = []
    for data in units_data:
        unit, created = Unit.objects.get_or_create(
            property=property,
            unit_number=data['unit_number'],
            defaults=data,
        )
        if created:
            print(f"    Created unit {data['unit_number']} for {property.title}")
        units.append(unit)
    return units


def create_tenants_and_leases(units, landlord):
    tenant_data = [
        {
            'full_name': 'Chinedu Okafor',
            'phone': '08012345678',
            'email': 'chinedu.okafor@gmail.com',
            'unit': units[0],
            'lease_start': '2025-01-01',
            'lease_end': '2025-12-31',
            'rent_amount': '500000',
            'rent_due_day': 1,
            'id_type': 'nin',
            'id_number': 'TN000001',
        },
        {
            'full_name': 'Adaeze Okonkwo',
            'phone': '08098765432',
            'email': 'adaeze.okonkwo@gmail.com',
            'unit': units[1],
            'lease_start': '2025-03-01',
            'lease_end': '2026-02-28',
            'rent_amount': '350000',
            'rent_due_day': 5,
            'id_type': 'passport',
            'id_number': 'TN000002',
        },
    ]

    for td in tenant_data:
        tenant, created = Tenant.objects.get_or_create(
            unit=td['unit'],
            defaults={
                'full_name': td['full_name'],
                'phone': td['phone'],
                'email': td['email'],
                'id_type': td['id_type'],
                'id_number': td['id_number'],
                'is_verified': True,
            },
        )
        if created:
            print(f"    Created tenant: {td['full_name']}")

        lease, created = Lease.objects.get_or_create(
            unit=td['unit'],
            tenant=tenant,
            defaults={
                'landlord': landlord,
                'start_date': td['lease_start'],
                'end_date': td['lease_end'],
                'rent_amount': td['rent_amount'],
                'rent_due_day': td['rent_due_day'],
                'status': 'active',
                'notice_period_days': 30,
                'ndpr_consent': True,
            },
        )
        if created:
            print(f"    Created lease for {td['full_name']} (Unit {td['unit'].unit_number})")
            tenant.lease = lease
            tenant.save()


class Command(BaseCommand):
    help = "Seed the database with demo users, landlords, agents, properties, units, tenants, and leases."

    def handle(self, *args, **options):
        print("Seeding tenancy data...")

        # --- Agent 1: Manager ---
        agent_user1 = create_user('08011111111', is_staff=True)
        agent1 = create_agent(agent_user1, 'John Adeyemi', role='manager', phone='08011111111')
        agent1.role = 'manager'
        agent1.save()

        # --- Agent 2: Regular Agent ---
        agent_user2 = create_user('08022222222', is_staff=True)
        agent2 = create_agent(agent_user2, 'Mary Okafor', role='agent', phone='08022222222')

        # --- Landlord 1 ---
        landlord_user1 = create_user('08033333333')
        landlord1 = create_landlord(landlord_user1, 'Mrs. Funmi Adebayo', id_number='LD000001')

        # --- Landlord 2 ---
        landlord_user2 = create_user('08044444444')
        landlord2 = create_landlord(landlord_user2, 'Alh. Musa Ibrahim', id_number='LD000002')

        # --- Get or create properties ---
        prop1, created = Property.objects.get_or_create(
            title='Exquisite 5 Bedroom Fully Detached Duplex with BQ & Swimming Pool',
            defaults={
                'description': 'Contemporary masterpiece in Lekki Phase 1 with smart home automation, private swimming pool, and 24/7 power backup.',
                'property_type': 'fully_detached_duplex',
                'purpose': 'rent',
                'price': '35000000',
                'is_negotiable': True,
                'address': '12 Admiralty Way',
                'city': 'Lekki',
                'state': 'Lagos',
                'area': 'Lekki Phase 1',
                'bedrooms': 5,
                'bathrooms': 6,
                'toilets': 6,
                'status': 'rented',
                'is_featured': True,
            },
        )
        if created:
            print(f"  Created property: {prop1.title}")

        prop2, created = Property.objects.get_or_create(
            title='Contemporary 2 Bedroom Serviced Luxury Flat',
            defaults={
                'description': 'Sleek 2-bedroom flat in the heart of Ikoyi with premium amenities including gym, rooftop pool, and 24/7 concierge.',
                'property_type': 'flat',
                'purpose': 'rent',
                'price': '1500000',
                'is_negotiable': False,
                'address': '8 Awolowo Road',
                'city': 'Ikoyi',
                'state': 'Lagos',
                'area': 'Ikoyi',
                'bedrooms': 2,
                'bathrooms': 2,
                'toilets': 2,
                'status': 'rented',
                'is_featured': True,
            },
        )
        if created:
            print(f"  Created property: {prop2.title}")

        prop3, created = Property.objects.get_or_create(
            title='Chic Short-Let Serviced Studio Near Victoria Island',
            defaults={
                'description': 'Modern furnished studio ideal for short stays, minutes from Victoria Island business district.',
                'property_type': 'short_let',
                'purpose': 'short_let',
                'price': '120000',
                'is_negotiable': False,
                'address': '7a Bourdillon Road',
                'city': 'Ikoyi',
                'state': 'Lagos',
                'area': 'Bourdillon',
                'bedrooms': 1,
                'bathrooms': 1,
                'toilets': 1,
                'status': 'available',
                'is_featured': False,
            },
        )
        if created:
            print(f"  Created property: {prop3.title}")

        # --- Create units for each property ---
        for prop in [prop1, prop2, prop3]:
            units = create_units_for_property(prop)
            # Create tenants and leases for occupied units
            create_tenants_and_leases(units, landlord1 if prop == prop1 else landlord2)

        # --- Create PropertyAgentAssignments ---
        pa1, created = PropertyAgentAssignment.objects.get_or_create(
            property=prop1,
            agent=agent1,
            landlord=landlord1,
            defaults={'role': 'managing_agent'},
        )
        if created:
            print(f"  Assigned {agent1.full_name} to manage {prop1.title} for {landlord1.full_name}")

        pa2, created = PropertyAgentAssignment.objects.get_or_create(
            property=prop2,
            agent=agent2,
            landlord=landlord1,
            defaults={'role': 'managing_agent'},
        )
        if created:
            print(f"  Assigned {agent2.full_name} to manage {prop2.title} for {landlord1.full_name}")

        pa3, created = PropertyAgentAssignment.objects.get_or_create(
            property=prop3,
            agent=agent2,
            landlord=landlord2,
            defaults={'role': 'managing_agent'},
        )
        if created:
            print(f"  Assigned {agent2.full_name} to manage {prop3.title} for {landlord2.full_name}")

        # --- Landlord 2 property with units ---
        prop4, created = Property.objects.get_or_create(
            title='Serene 3 Bedroom Terrace Duplex in Gated Estate',
            defaults={
                'property_type': 'terrace_duplex',
                'purpose': 'sale',
                'price': '180000000',
                'is_negotiable': False,
                'address': '5 Prince & Princess Estate',
                'city': 'Lekki',
                'state': 'Lagos',
                'area': 'Lekki Phase 2',
                'bedrooms': 3,
                'bathrooms': 4,
                'toilets': 4,
                'status': 'available',
                'is_featured': False,
            },
        )
        if created:
            print(f"  Created property: {prop4.title}")
            units4 = create_units_for_property(prop4)
            create_tenants_and_leases(units4, landlord2)

        print("\n✅ Done seeding tenancy data.")
        print(f"   Users: {User.objects.count()}")
        print(f"   Landlords: {LandlordProfile.objects.count()}")
        print(f"   Agents: {AgentProfile.objects.count()}")
        print(f"   Properties: {Property.objects.count()}")
        print(f"   Units: {Unit.objects.count()}")
        print(f"   Tenants: {Tenant.objects.count()}")
        print(f"   Leases: {Lease.objects.count()}")
        print(f"   Property-Agent Assignments: {PropertyAgentAssignment.objects.count()}")
