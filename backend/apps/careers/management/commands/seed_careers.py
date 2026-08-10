from django.core.management.base import BaseCommand

from apps.careers.models import JobOpening


SEED_OPENINGS = [
    {
        "title": "Property Verification Officer",
        "team": "Operations",
        "location": "Lagos",
        "employment_type": "full_time",
        "summary": (
            "Physically inspect and legally verify properties against land registries "
            "before they go live on the platform."
        ),
    },
    {
        "title": "Concierge Manager",
        "team": "Sales & Customer Experience",
        "location": "Lagos",
        "employment_type": "full_time",
        "summary": (
            "Own the 2-Week Concierge journey — sourcing and verifying properties for "
            "buyers and renters who can't find what they need."
        ),
    },
    {
        "title": "Legal Associate — Real Estate",
        "team": "Legal & Compliance",
        "location": "Lagos / Abuja",
        "employment_type": "full_time",
        "summary": (
            "Draft and review agreements, verify title documents, and shepherd "
            "transactions through Governor's consent."
        ),
    },
    {
        "title": "Software Engineer — Full Stack",
        "team": "Engineering",
        "location": "Remote (Nigeria)",
        "employment_type": "full_time",
        "summary": (
            "Build and scale the marketplace, verification tooling, and landlord "
            "dashboard used across 42+ cities."
        ),
    },
    {
        "title": "Growth Marketing Manager",
        "team": "Marketing",
        "location": "Lagos",
        "employment_type": "full_time",
        "summary": (
            "Own acquisition and brand across digital channels to grow supply of "
            "verified listings and demand from buyers and renters."
        ),
    },
    {
        "title": "Customer Success Associate",
        "team": "Sales & Customer Experience",
        "location": "Lagos",
        "employment_type": "full_time",
        "summary": (
            "Be the first point of contact for buyers, renters, and landlords — "
            "guiding them from inquiry to close."
        ),
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo job openings for the careers page."

    def handle(self, *args, **options):
        created = 0
        for order, data in enumerate(SEED_OPENINGS, start=1):
            title = data["title"]
            if JobOpening.objects.filter(title=title).exists():
                self.stdout.write(self.style.WARNING(f"Skipping (already exists): {title}"))
                continue

            JobOpening.objects.create(order=order, **data)
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Created: {title}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created} new openings "
                f"({JobOpening.objects.count()} total)."
            )
        )
