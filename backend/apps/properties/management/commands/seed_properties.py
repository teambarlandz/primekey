from django.core.management.base import BaseCommand

from apps.properties.models import Property, PropertyImage


SEED_LISTINGS = [
    {
        "title": "Exquisite 5 Bedroom Fully Detached Duplex with BQ & Swimming Pool",
        "description": (
            "This contemporary masterpiece is built to international standards, situated in a serene "
            "and secured neighborhood in Lekki Phase 1. Features high ceilings, fully fitted modern "
            "chef kitchen, integrated sound system, private swimming pool, smart home automation, and "
            "24/7 power backup ready."
        ),
        "property_type": "fully_detached_duplex",
        "purpose": "sale",
        "price": "350000000",
        "is_negotiable": True,
        "address": "12 Admiralty Way",
        "city": "Lekki",
        "state": "Lagos",
        "area": "Lekki Phase 1",
        "bedrooms": 5,
        "bathrooms": 6,
        "toilets": 6,
        "is_serviced": False,
        "is_furnished": True,
        "status": "available",
        "is_featured": True,
        "image": "https://images.nigeriapropertycentre.com/media/listings/117/2170177/52b3f7d4d4f1b1a6bfcdb7e0e9d3a9f6/full_view_image.webp",
    },
    {
        "title": "Contemporary 2 Bedroom Serviced Luxury Flat",
        "description": (
            "A sleek and fully serviced 2-bedroom flat in the heart of Ikoyi. Enjoy premium amenities "
            "including a modern gym, rooftop pool, 24/7 concierge, backup power, and easy access to "
            "key business districts."
        ),
        "property_type": "flat",
        "purpose": "rent",
        "price": "15000000",
        "is_negotiable": False,
        "address": "8 Awolowo Road",
        "city": "Ikoyi",
        "state": "Lagos",
        "area": "Ikoyi",
        "bedrooms": 2,
        "bathrooms": 2,
        "toilets": 2,
        "is_serviced": True,
        "is_furnished": True,
        "status": "available",
        "is_featured": True,
        "image": "https://images.nigeriapropertycentre.com/media/listings/104/2171046/6c9a2a3c1f3c4d5f8f4f5a0b9d2f3e1a/full_view_image.webp",
    },
    {
        "title": "Ultra-Modern Architectural Mansion with Pool",
        "description": (
            "An architectural masterpiece in Maitama featuring a grand double-volume living room, "
            "cinema, indoor pool, home automation, staff quarters, and landscaped gardens on a "
            "spacious plot."
        ),
        "property_type": "mansion",
        "purpose": "sale",
        "price": "850000000",
        "is_negotiable": True,
        "address": "23 Yakubu Gowon Crescent",
        "city": "Maitama",
        "state": "FCT",
        "area": "Maitama",
        "bedrooms": 7,
        "bathrooms": 8,
        "toilets": 8,
        "is_serviced": False,
        "is_furnished": False,
        "status": "available",
        "is_featured": True,
        "image": "https://images.nigeriapropertycentre.com/media/listings/98/2171098/3f5b8d2c1e4a4c6f9d0b2e8a1c4f6b2d/full_view_image.webp",
    },
    {
        "title": "Waterfront Luxury Villa with Private Jet Ski Ramp",
        "description": (
            "Breathtaking waterfront living on Banana Island with panoramic lagoon views. Features a "
            "private jet ski ramp, infinity pool, smart home system, 7 bedrooms all en-suite, and "
            "dedicated staff quarters."
        ),
        "property_type": "fully_detached_duplex",
        "purpose": "sale",
        "price": "1200000000",
        "is_negotiable": True,
        "address": "15 Banana Island",
        "city": "Ikoyi",
        "state": "Lagos",
        "area": "Banana Island",
        "bedrooms": 6,
        "bathrooms": 7,
        "toilets": 7,
        "is_serviced": False,
        "is_furnished": True,
        "status": "available",
        "is_featured": True,
        "image": "https://images.nigeriapropertycentre.com/media/listings/72/2171072/8d1a2c3b4e5f6a7d9c0b1e2f3a4d5c6e/full_view_image.webp",
    },
    {
        "title": "Serene 3 Bedroom Terrace Duplex in Gated Estate",
        "description": (
            "Beautifully finished 3-bedroom terrace duplex in a secure gated estate. Open-plan living, "
            "fitted kitchen, en-suite rooms, dedicated parking, and a small garden perfect for families."
        ),
        "property_type": "terrace_duplex",
        "purpose": "sale",
        "price": "180000000",
        "is_negotiable": False,
        "address": "5 Prince & Princess Estate",
        "city": "Lekki",
        "state": "Lagos",
        "area": "Lekki Phase 2",
        "bedrooms": 3,
        "bathrooms": 4,
        "toilets": 4,
        "is_serviced": False,
        "is_furnished": False,
        "status": "available",
        "is_featured": False,
        "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
    },
    {
        "title": "Chic Short-Let Serviced Studio Near Victoria Island",
        "description": (
            "A modern, fully furnished studio ideal for short stays. Minutes from Victoria Island "
            "business district, with WiFi, air conditioning, weekly housekeeping, and 24/7 security."
        ),
        "property_type": "short_let",
        "purpose": "short_let",
        "price": "120000",
        "is_negotiable": False,
        "address": "7a Bourdillon Road",
        "city": "Ikoyi",
        "state": "Lagos",
        "area": "Bourdillon",
        "bedrooms": 1,
        "bathrooms": 1,
        "toilets": 1,
        "is_serviced": True,
        "is_furnished": True,
        "status": "available",
        "is_featured": False,
        "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo property listings and their image galleries."

    def handle(self, *args, **options):
        created = 0
        for data in SEED_LISTINGS:
            title = data["title"]
            if Property.objects.filter(title=title).exists():
                self.stdout.write(self.style.WARNING(f"Skipping (already exists): {title}"))
                continue

            image_url = data.pop("image")
            prop = Property.objects.create(**data)
            PropertyImage.objects.create(
                property=prop,
                image_url=image_url,
                caption=prop.area,
                is_primary=True,
            )
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Created: {title}"))

        self.stdout.write(
            self.style.SUCCESS(f"Done. Created {created} new listings "
                               f"({Property.objects.count()} total).")
        )
