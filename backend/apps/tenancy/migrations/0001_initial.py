# Generated migration for tenancy app
# python manage.py makemigrations tenancy

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('properties', '0004_alter_property_bathrooms_alter_property_bedrooms_and_more'),
        ('landlords', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('unit_number', models.CharField(max_length=20)),
                ('unit_type', models.CharField(choices=[('self_contain', 'Self-Contain'), ('room_and_parlour', 'Room & Parlour'), ('single_room', 'Single Room'), ('bq', "Boys' Quarters"), ('flat', 'Flat'), ('studio', 'Studio')], default='flat', max_length=20)),
                ('bedrooms', models.IntegerField(default=1, validators=[django.core.validators.MinValueValidator(0)])),
                ('bathrooms', models.IntegerField(default=1, validators=[django.core.validators.MinValueValidator(0)])),
                ('rent_amount', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0)])),
                ('status', models.CharField(choices=[('available', 'Available'), ('occupied', 'Occupied'), ('maintenance', 'Under Maintenance')], default='available', max_length=20)),
                ('is_furnished', models.BooleanField(default=False)),
                ('description', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='units', to='properties.property')),
            ],
            options={
                'db_table': 'tenancy_units',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='unit',
            constraint=models.UniqueConstraint(fields=['property', 'unit_number'], name='unique_property_unit_number'),
        ),
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('full_name', models.CharField(max_length=150)),
                ('phone', models.CharField(max_length=20, db_index=True)),
                ('email', models.EmailField(blank=True, null=True)),
                ('id_type', models.CharField(choices=[('nin', 'National ID (NIN)'), ('passport', 'International Passport'), ('driver_license', "Driver's License"), ('voter_card', "Permanent Voter's Card")], blank=True, max_length=30, null=True)),
                ('id_number', models.CharField(blank=True, max_length=50, null=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('lease', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tenant', to='tenancy.lease')),
                ('unit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tenant', to='tenancy.unit')),
            ],
            options={
                'db_table': 'tenancy_tenants',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Lease',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('rent_amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('rent_due_day', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(31)])),
                ('rent_frequency', models.CharField(choices=[('monthly', 'Monthly'), ('weekly', 'Weekly'), ('quarterly', 'Quarterly')], default='monthly', max_length=10)),
                ('status', models.CharField(choices=[('active', 'Active'), ('expired', 'Expired'), ('terminated', 'Terminated'), ('pending', 'Pending')], default='pending', max_length=20)),
                ('quit_notice_date', models.DateField(blank=True, null=True)),
                ('quit_notice_reason', models.TextField(blank=True, default='')),
                ('notice_period_days', models.IntegerField(default=30)),
                ('ndpr_consent', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('agent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='leases', to='dashboard.agentprofile')),
                ('landlord', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leases', to='landlords.landlordprofile')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leases', to='tenancy.tenant')),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leases', to='tenancy.unit')),
            ],
            options={
                'db_table': 'tenancy_leases',
                'ordering': ['-created_at'],
            },
        ),
    ]
