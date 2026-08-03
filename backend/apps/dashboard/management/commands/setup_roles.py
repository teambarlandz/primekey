import os

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

User = get_user_model()

# Each model is referenced as (app_label, model_name_lowercase). Permissions are
# resolved dynamically so the command stays in sync with the registered models.
PERMISSION_TARGETS = {
    "crm": [
        "conciergelead",
        "leadscore",
        "slaalert",
        "consentlog",
    ],
    "properties": [
        "property",
        "propertyimage",
    ],
    "landlords": [
        "landlordprofile",
        "propertyintake",
        "appointment",
        "documentvault",
    ],
    "compliance": [
        "consentlog",
        "exportrequest",
        "erasurerequest",
        "anonymizationlog",
    ],
    "otp_auth": [
        "otpcode",
    ],
    "dashboard": [
        "agentprofile",
    ],
    "notifications": [
        "notification",
    ],
    "messaging": [
        "whatsappthread",
        "whatsappmessage",
    ],
    "auth": [
        "user",
        "group",
    ],
}

# Permission verbs per role per model target.
ROLE_PERMISSIONS = {
    "ceo": {
        "view_all": [model for models in list(PERMISSION_TARGETS.values()) for model in models],
        "change": ["crm.conciergelead"],
        "exclude": ["otp_auth.otpcode", "auth.user", "auth.group"],
    },
    "cto": {
        "all": [
            "compliance.consentlog",
            "compliance.exportrequest",
            "compliance.erasurerequest",
            "compliance.anonymizationlog",
            "otp_auth.otpcode",
            "auth.user",
            "auth.group",
        ],
        "change": [
            "properties.property",
            "properties.propertyimage",
            "dashboard.agentprofile",
        ],
        "view_all": True,
        "exclude": [],
    },
    "coo": {
        "all": [
            "crm.conciergelead",
            "crm.leadscore",
            "crm.slaalert",
            "crm.consentlog",
        ],
        "change": [
            "properties.property",
            "properties.propertyimage",
            "landlords.landlordprofile",
            "landlords.propertyintake",
            "landlords.appointment",
            "landlords.documentvault",
            "messaging.whatsappthread",
            "messaging.whatsappmessage",
            "notifications.notification",
        ],
        "view_all": True,
        "exclude": ["otp_auth.otpcode", "auth.user", "auth.group"],
    },
}

ROLE_ACCOUNTS = [
    {
        "role": "ceo",
        "username": "ceo",
        "email": "ceo@primekeyhomes.ng",
        "name": "CEO",
    },
    {
        "role": "cto",
        "username": "cto",
        "email": "cto@primekeyhomes.ng",
        "name": "CTO",
    },
    {
        "role": "coo",
        "username": "coo",
        "email": "coo@primekeyhomes.ng",
        "name": "COO",
    },
]


class Command(BaseCommand):
    help = (
        "Create CEO / CTO / COO admin groups (with distinct privileges) and their "
        "staff accounts. Idempotent: re-running syncs group permissions only."
    )

    def add_arguments(self, parser):
        for account in ROLE_ACCOUNTS:
            role = account["role"]
            parser.add_argument(f"--{role}-password", default="", help=f"{role.upper()} account password")
            parser.add_argument(f"--{role}-username", default=account["username"], help=f"{role.upper()} username")
            parser.add_argument(f"--{role}-email", default=account["email"], help=f"{role.upper()} email")

    def _perms(self, app_label, model_name, verbs):
        codenames = []
        for verb in verbs:
            codenames.append(f"{verb}_{model_name}")
        return Permission.objects.filter(
            content_type__app_label=app_label,
            codename__in=codenames,
        )

    def _role_codenames(self, role_name):
        spec = ROLE_PERMISSIONS[role_name]
        targets = []
        for app_label, models in PERMISSION_TARGETS.items():
            for model in models:
                key = f"{app_label}.{model}"
                if key in spec.get("exclude", []):
                    continue
                if spec.get("all") and key in spec["all"]:
                    targets.append((app_label, model, ["add", "change", "delete", "view"]))
                    continue
                if spec.get("change") and key in spec["change"]:
                    targets.append((app_label, model, ["change", "view"]))
                    continue
                if spec.get("view_all"):
                    targets.append((app_label, model, ["view"]))
        return targets

    def _sync_group(self, role_name):
        group, created = Group.objects.get_or_create(name=role_name.upper())
        targets = self._role_codenames(role_name)
        perms = Permission.objects.none()
        for app_label, model, verbs in targets:
            perms |= self._perms(app_label, model, verbs)
        group.permissions.set(perms)
        return group, created

    def handle(self, *args, **options):
        for account in ROLE_ACCOUNTS:
            role = account["role"]
            group, created = self._sync_group(role)
            verb = "Created" if created else "Synced"
            self.stdout.write(self.style.SUCCESS(f"{verb} group {role.upper()} ({group.permissions.count()} permissions)"))

        for account in ROLE_ACCOUNTS:
            role = account["role"]
            username = options[f"{role}_username"]
            email = options[f"{role}_email"]
            # Password resolution order:
            #   1. CLI flag (--ceo-password)  -> highest priority
            #   2. Environment variable (CEO_PASSWORD)  -> loaded from .env or shell
            #   3. Temporary placeholder (ChangeMe-ROLE!)  -> must be changed after first login
            env_var = f"{role.upper()}_PASSWORD"
            password = (
                options.get(f"{role}_password")
                or os.environ.get(env_var, "")
                or f"ChangeMe-{role.upper()}!"
            )

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": account["name"],
                    "is_staff": True,
                    "is_active": True,
                },
            )
            if not created:
                user.is_staff = True
                user.is_active = True
                user.first_name = account["name"]
                if email:
                    user.email = email
                user.save()

            if password:
                user.set_password(password)
                user.save()

            user.groups.set([Group.objects.get(name=role.upper())])

            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'} staff account {username} "
                    f"({account['name']}, group={role.upper()}, superuser={user.is_superuser})"
                )
            )
