from django.test import TestCase
from model_bakery import baker
from reporting.service.report_history_dashboard_service import ReportingHistoryDashboardService
from reporting.schema.report_history import ReportHistoryResponse


class TestReportingHistoryDashboardService(TestCase):
    def setUp(self):
        self.report = baker.make_recipe("reporting.tests.utils.report")
        self.user_1 = baker.make_recipe("registration.tests.utils.industry_operator_user")
        self.user_2 = baker.make_recipe("registration.tests.utils.industry_operator_user")

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
        report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(
            self.report.id
        )
        self.assertEqual(report_versions.count(), 2)

        self.assertEqual(report_versions[0].id, self.report_version_2.id)
        self.assertEqual(report_versions[1].id, self.report_version_1.id)

        self.assertEqual(ReportHistoryResponse.resolve_version(report_versions[0]), "Current Version")
        self.assertEqual(ReportHistoryResponse.resolve_version(report_versions[1]), "Version 2")
