from rest_framework import serializers

from .models import JobOpening


class JobOpeningSerializer(serializers.ModelSerializer):
    """
    Public serializer for job openings rendered on the careers page.
    """

    employment_type_display = serializers.CharField(
        source="get_employment_type_display", read_only=True
    )

    class Meta:
        model = JobOpening
        fields = [
            "id",
            "title",
            "team",
            "location",
            "employment_type",
            "employment_type_display",
            "summary",
            "application_email",
        ]
