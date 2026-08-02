from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.dashboard.models import AgentProfile

User = get_user_model()


class Command(BaseCommand):
    help = "Create an agent account with an associated Django user."

    def add_arguments(self, parser):
        parser.add_argument("--phone", required=True, help="Agent phone number (e.g., 08012345678)")
        parser.add_argument("--name", default="", help="Agent full name")
        parser.add_argument("--role", choices=["agent", "manager", "admin"], default="agent", help="Agent role")

    def handle(self, *args, **options):
        phone = options["phone"]
        if AgentProfile.objects.filter(phone=phone).exists():
            self.stdout.write(self.style.WARNING(f"Agent with phone {phone} already exists."))
            return

        user, created = User.objects.get_or_create(
            username=phone,
            defaults={"is_active": True},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created user {phone}"))

        agent = AgentProfile.objects.create(
            user=user,
            phone=phone,
            full_name=options["name"],
            role=options["role"],
        )
        self.stdout.write(
            self.style.SUCCESS(f"Created {agent.get_role_display()} agent {agent.full_name or phone} (id={agent.id})")
        )
