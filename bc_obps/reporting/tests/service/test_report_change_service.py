from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.schema.report_change import ReportChangeIn
from reporting.service.report_change_service import ReportChangeService


class TestReportChangeService(TestCase):
    def setUp(self):
        # Arrange: Create a report version and additional data
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.report_change = make_recipe('reporting.tests.utils.report_change', report_version=self.report_version)

    def test_get_report_change_returns_correct_instance(self):
        """
        Test that the service retrieves the correct ReportChange instance
        for a given report version ID.
        """

        retrieved_data = ReportChangeService.get_report_change_by_version_id(report_version_id=self.report_version.id)
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data.report_version.id, self.report_version.id)
        self.assertEqual(
            retrieved_data.reason_for_change,
            self.report_change.reason_for_change,
        )

    def test_save_report_change_saves_record(self):
        """
        Test that the service updates or creates ReportChange instance
        for a given report version ID.
        """

        data = ReportChangeIn(
            reason_for_change="Service test",
        )

        report_change = ReportChangeService.save_report_change(
            report_version_id=self.report_version.id,
            data=data,
        )

        self.assertEqual(report_change.report_version, self.report_version)
        self.assertEqual(report_change.reason_for_change, data.reason_for_change)
