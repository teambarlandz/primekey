from rest_framework import serializers

from .models import JobApplication, JobOpening


class JobOpeningSerializer(serializers.ModelSerializer):
    """
    Public serializer for job openings rendered on the careers listing page.
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


class JobOpeningDetailSerializer(serializers.ModelSerializer):
    """
    Full detail serializer for a single job opening (job detail page).
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
            "created_at",
        ]


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer for job applications. Validates file upload and NDPR consent.
    """

    resume = serializers.FileField(required=True)

    class Meta:
        model = JobApplication
        fields = [
            "job_opening",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone",
            "cover_letter",
            "resume",
            "ndpr_consent",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def validate_ndpr_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must accept the NDPR privacy policy to submit your application."
            )
        return value

    def validate_resume(self, file):
        allowed_extensions = ("pdf", "docx")
        max_size = 5 * 1024 * 1024  # 5 MB

        name = getattr(file, "name", "") or ""
        ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""

        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Resume must be a PDF or DOCX file. Got .{ext or 'unknown'}."
            )
        if file.size > max_size:
            raise serializers.ValidationError(
                "Resume file size must not exceed 5 MB."
            )
        return file

    def validate(self, attrs):
        job_opening = attrs.get("job_opening")
        if job_opening and not job_opening.is_active:
            raise serializers.ValidationError(
                {"job_opening": "This position is no longer accepting applications."}
            )
        return attrs


class JobApplicationDetailSerializer(serializers.ModelSerializer):
    """
    Read serializer for job applications (admin/staff view).
    Excludes sensitive internal fields.
    """

    job_title = serializers.CharField(source="job_opening.title", read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_opening",
            "job_title",
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "cover_letter",
            "resume",
            "status",
            "ndpr_consent",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
