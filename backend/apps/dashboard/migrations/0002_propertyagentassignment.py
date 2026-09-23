# Generated migration for dashboard app (PropertyAgentAssignment)
# python manage.py makemigrations dashboard

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
            name='PropertyAgentAssignment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.CharField(choices=[('managing_agent', 'Managing Agent'), ('co_agent', 'Co-Agent')], default='managing_agent', max_length=20)),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assigned_properties', to='dashboard.agentprofile')),
                ('landlord', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='agent_assignments', to='landlords.landlordprofile')),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='agent_assignments', to='properties.property')),
            ],
            options={
                'db_table': 'property_agent_assignments',
            },
        ),
        migrations.AddConstraint(
            model_name='propertyagentassignment',
            constraint=models.UniqueConstraint(fields=['property', 'agent'], name='unique_property_agent'),
        ),
    ]
