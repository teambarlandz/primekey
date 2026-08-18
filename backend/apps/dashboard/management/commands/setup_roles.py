import os
import secrets

from django.conf import settings
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
    "careers": [
        "jobopening",
        "jobapplication",
    ],
    "admin": [
        "logentry",
    ],
}

# Permission verbs per role per model target.
# CEO, CTO, COO get full CRUD on every model. The admin superuser bypasses
# groups entirely (is_superuser=True), so it is not listed here.
ALL_MODELS = [f"{app}.{model}" for app, models in PERMISSION_TARGETS.items() for model in models]

ROLE_PERMISSIONS = {
    "ceo": {
        "all": ALL_MODELS,
        "exclude": [],
    },
    "cto": {
        "all": ALL_MODELS,
        "exclude": [],
    },
    "coo": {
        "all": ALL_MODELS,
        "exclude": [],
    },
}

ROLE_ACCOUNTS = [
    {
        "role": "admin",
        "username": "admin",
        "email": "admin@primekeyhomesandpropertiesltd.com",
        "name": "Administrator",
        "is_superuser": True,
    },
    {
        "role": "ceo",
        "username": "ceo",
        "email": "ceo@primekeyhomesandpropertiesltd.com",
        "name": "CEO",
    },
    {
        "role": "cto",
        "username": "cto",
        "email": "cto@primekeyhomesandpropertiesltd.com",
        "name": "CTO",
    },
    {
        "role": "coo",
        "username": "coo",
        "email": "coo@primekeyhomesandpropertiesltd.com",
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

    def _ensure_permissions(self):
        """Create Permission objects for all registered models if they don't exist.

        Django's ``post_migrate`` signal usually handles this, but if
        ``setup_roles`` runs before or without migrations, the permissions
        won't exist and ``group.permissions.set()`` silently assigns none.
        """
        from django.contrib.contenttypes.models import ContentType

        created = 0
        for app_label, models in PERMISSION_TARGETS.items():
            for model_name in models:
                ct, ct_created = ContentType.objects.get_or_create(
                    app_label=app_label,
                    model=model_name,
                )
                if ct_created:
                    created += 1
                for verb in ("add", "change", "delete", "view"):
                    codename = f"{verb}_{model_name}"
                    _, perm_created = Permission.objects.get_or_create(
                        codename=codename,
                        content_type=ct,
                        defaults={"name": f"Can {verb} {model_name}"},
                    )
                    if perm_created:
                        created += 1
        return created

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
        missing = []
        for app_label, model, verbs in targets:
            found = self._perms(app_label, model, verbs)
            if found.count() != len(verbs):
                expected = {f"{v}_{model}" for v in verbs}
                found_names = set(found.values_list("codename", flat=True))
                missing.extend(expected - found_names)
            perms |= found
        group.permissions.set(perms)
        return group, created, missing

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Ensuring permission objects exist..."))
        created_count = self._ensure_permissions()
        if created_count:
            self.stdout.write(self.style.SUCCESS(f"Created {created_count} missing permission/content-type objects."))
        else:
            self.stdout.write(self.style.SUCCESS("All permission objects already exist."))

        for account in ROLE_ACCOUNTS:
            role = account["role"]
            is_superuser = account.get("is_superuser", False)

            # Superuser doesn't need group permissions — it bypasses them.
            if not is_superuser:
                group, created, missing = self._sync_group(role)
                verb = "Created" if created else "Synced"
                self.stdout.write(self.style.SUCCESS(f"{verb} group {role.upper()} ({group.permissions.count()} permissions)"))
                if missing:
                    self.stdout.write(self.style.WARNING(
                        f"  Missing permissions for {role.upper()}: {', '.join(sorted(missing))}"
                    ))

        for account in ROLE_ACCOUNTS:
            role = account["role"]
            is_superuser = account.get("is_superuser", False)
            username = options[f"{role}_username"]
            email = options[f"{role}_email"]
            # Password resolution order:
            #   1. CLI flag (--admin-password)  -> highest priority
            #   2. Environment variable (ADMIN_PASSWORD)  -> loaded from .env or shell
            #   3. Development placeholder (ChangeMe-ROLE!)  -> DEBUG only
            #   4. Random one-time password  -> production (printed once, never stored)
            env_var = f"{role.upper()}_PASSWORD"
            password = options.get(f"{role}_password") or os.environ.get(env_var, "")
            if not password:
                if settings.DEBUG:
                    password = f"ChangeMe-{role.upper()}!"
                else:
                    password = secrets.token_urlsafe(18)
                    self.stdout.write(
                        self.style.WARNING(
                            f"No password provided for {username}; a one-time password was generated. "
                            f"Save it now, it cannot be retrieved later: {password}"
                        )
                    )

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": account["name"],
                    "is_staff": True,
                    "is_active": True,
                    "is_superuser": is_superuser,
                },
            )
            if not created:
                user.is_staff = True
                user.is_active = True
                user.is_superuser = is_superuser
                user.first_name = account["name"]
                if email:
                    user.email = email
                user.save()

            if password:
                user.set_password(password)
                user.save()

            # Assign group (superuser doesn't need one, but harmless to skip)
            if not is_superuser:
                user.groups.set([Group.objects.get(name=role.upper())])

            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'} staff account {username} "
                    f"({account['name']}, group={'NONE' if is_superuser else role.upper()}, superuser={is_superuser})"
                )
            )
