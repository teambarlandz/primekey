from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()


class Command(BaseCommand):
    help = "Reset a user's password. Admin can reset any user; CEO can reset staff (non-superusers)."

    def add_arguments(self, parser):
        parser.add_argument("username", type=str, help="Username of the user to reset")
        parser.add_argument("new_password", type=str, help="New password to set")
        parser.add_argument(
            "--acting-as",
            type=str,
            help="Username of the acting user (for permission checks)",
            default="admin",
        )

    def handle(self, *args, **options):
        username = options["username"]
        new_password = options["new_password"]
        acting_username = options["acting_as"]

        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User '{username}' does not exist.")

        try:
            acting_user = User.objects.get(username=acting_username)
        except User.DoesNotExist:
            raise CommandError(f"Acting user '{acting_username}' does not exist.")

        # Permission checks
        if not acting_user.is_superuser:
            # Non-superuser (CEO/CTO/COO) can only reset staff who are not superusers
            if target_user.is_superuser:
                raise CommandError("You cannot reset a superuser's password.")
            if not target_user.is_staff:
                raise CommandError("You can only reset staff accounts.")

        # All checks passed
        target_user.set_password(new_password)
        target_user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully reset password for user '{username}' (by {acting_username})"
            )
        )