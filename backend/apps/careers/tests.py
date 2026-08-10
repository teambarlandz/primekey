from django.test import TestCase
from rest_framework import status

from .models import JobOpening


class JobOpeningListViewTests(TestCase):
    def setUp(self):
        self.active = JobOpening.objects.create(
            title="Software Engineer — Full Stack",
            team="Engineering",
            location="Remote (Nigeria)",
            employment_type="full_time",
            is_active=True,
            order=1,
        )
        self.inactive = JobOpening.objects.create(
            title="Hidden Role",
            team="Operations",
            location="Lagos",
            is_active=False,
            order=2,
        )

    def test_list_returns_only_active_openings(self):
        response = self.client.get("/api/v1/careers/openings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["count"], 1)
        self.assertEqual(len(body["results"]), 1)
        result = body["results"][0]
        self.assertEqual(result["title"], self.active.title)
        self.assertEqual(result["employment_type_display"], "Full-time")
        self.assertIn("application_email", result)

    def test_list_returns_empty_when_no_active_openings(self):
        self.active.is_active = False
        self.active.save()
        response = self.client.get("/api/v1/careers/openings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 0)
        self.assertEqual(body["results"], [])
