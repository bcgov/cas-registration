from django.test import TestCase
from model_bakery import baker

from reporting.service.report_history_dashboard_service import ReportingHistoryDashboardService


class TestReportingHistoryDashboardService(TestCase):
    def setUp(self):
        # Arrange: Create a report version instance and associated user data
        self.report = baker.make_recipe("reporting.tests.utils.report")
        self.user_1 = self.user = baker.make_recipe("registration.tests.utils.industry_operator_user")
        self.user_2 = self.user = baker.make_recipe("registration.tests.utils.industry_operator_user")

        self.report_version_1 = baker.make(
            'reporting.ReportVersion', status="Draft", report=self.report, updated_by=self.user_1
        )
        self.report_version_2 = baker.make(
            'reporting.ReportVersion', status="Submitted", report=self.report, updated_by=self.user_2
        )

    def test_get_report_versions_for_report_history_dashboard(self):
        """
        Test the service function for fetching report versions with annotations
        for a given report_id.
        """
        # Act: Call the service method to get the report versions
        report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(
            self.report.id
        )

        # Assert: Ensure that the versions are fetched correctly and annotated as expected
        self.assertEqual(report_versions.count(), 2)

        # Check if versions are ordered by ID in descending order
        self.assertEqual(report_versions[0].id, self.report_version_2.id)
        self.assertEqual(report_versions[1].id, self.report_version_1.id)

        # Check if the version names are correctly annotated
        self.assertEqual(report_versions[0].version, "Current Version")
        self.assertEqual(report_versions[1].version, "Version 1")
