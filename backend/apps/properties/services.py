from django.db.models import Q, QuerySet
from decimal import Decimal
from .models import Property


class SearchService:
    """
    Domain service executing structured search queries against available property listings.
    """

    @classmethod
    def filter_properties(cls, params: dict) -> QuerySet[Property]:
        # Filter for available listings by default
        queryset = Property.objects.filter(status='available')

        # 1. Location Search (Matches area, city, state, or full address)
        location = params.get('location') or params.get('q')
        if location:
            loc_clean = location.strip()
            queryset = queryset.filter(
                Q(area__icontains=loc_clean) |
                Q(city__icontains=loc_clean) |
                Q(state__icontains=loc_clean) |
                Q(address__icontains=loc_clean)
            )

        # 2. Property Purpose Filter (Buy / Rent / Short Let)
        purpose = params.get('purpose')
        if purpose and purpose.lower() != 'all':
            queryset = queryset.filter(purpose__iexact=purpose)

        # 3. Property Type Filter
        property_type = params.get('property_type')
        if property_type and property_type.lower() != 'any':
            queryset = queryset.filter(property_type__iexact=property_type)

        # 4. Price Range Filter (in NGN)
        min_price = params.get('min_price')
        if min_price and min_price != '':
            try:
                queryset = queryset.filter(price__gte=Decimal(str(min_price)))
            except (ValueError, TypeError):
                pass

        max_price = params.get('max_price')
        if max_price and max_price != '':
            try:
                queryset = queryset.filter(price__lte=Decimal(str(max_price)))
            except (ValueError, TypeError):
                pass

        # 5. Bedrooms Filter
        bedrooms = params.get('bedrooms')
        if bedrooms and bedrooms != 'any':
            try:
                if str(bedrooms).endswith('+'):
                    min_beds = int(str(bedrooms)[:-1])
                    queryset = queryset.filter(bedrooms__gte=min_beds)
                else:
                    queryset = queryset.filter(bedrooms=int(bedrooms))
            except (ValueError, TypeError):
                pass

        # 6. Additional Feature Toggles
        if params.get('is_serviced') == 'true':
            queryset = queryset.filter(is_serviced=True)
        if params.get('is_furnished') == 'true':
            queryset = queryset.filter(is_furnished=True)

        # Ordering
        sort_by = params.get('sort_by', '-created_at')
        if sort_by in ['price', '-price', 'created_at', '-created_at']:
            queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset.prefetch_related('images')
