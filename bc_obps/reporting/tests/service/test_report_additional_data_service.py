from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.schema.report_additional_data import ReportAdditionalDataIn
from reporting.service.report_additional_data import ReportAdditionalDataService


class TestReportAdditionalDataService(TestCase):
    def setUp(self):
        # Arrange: Create a report version and additional data
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.report_additional_data = make_recipe(
            'reporting.tests.utils.report_additional_data', report_version=self.report_version
        )

    def test_get_report_report_additional_data_returns_correct_instance(self):
        """
        Test that the service retrieves the correct ReportAdditionalData instance
        for a given report version ID.
        """

        retrieved_data = ReportAdditionalDataService.get_report_report_additional_data(
            report_version_id=self.report_version.id
        )
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data.report_version.id, self.report_version.id)
        self.assertEqual(
            retrieved_data.capture_emissions,
            self.report_additional_data.capture_emissions,
        )
        self.assertEqual(
            retrieved_data.emissions_on_site_use,
            self.report_additional_data.emissions_on_site_use,
        )
        self.assertEqual(
            retrieved_data.emissions_on_site_sequestration,
            self.report_additional_data.emissions_on_site_sequestration,
        )
        self.assertEqual(
            retrieved_data.emissions_off_site_transfer,
            self.report_additional_data.emissions_off_site_transfer,
        )
        self.assertEqual(
            retrieved_data.electricity_generated,
            self.report_additional_data.electricity_generated,
        )

    def test_save_report_additional_data_saves_record(self):
        """
        Test that the service updates or creates ReportAdditionalData instance
        for a given report version ID.
        """

        data = ReportAdditionalDataIn(
            report_version=self.report_version.id,
            capture_emissions=True,
            emissions_on_site_use=10,
            emissions_on_site_sequestration=20,
            emissions_off_site_transfer=50,
            electricity_generated=50,
        )

        report_additional_data = ReportAdditionalDataService.save_report_additional_data(
            version_id=self.report_version.id,
            data=data,
        )

        self.assertEqual(report_additional_data.emissions_on_site_use, data.emissions_on_site_use)
        self.assertEqual(report_additional_data.emissions_on_site_sequestration, data.emissions_on_site_sequestration)
        self.assertEqual(report_additional_data.capture_emissions, data.capture_emissions)
        self.assertEqual(report_additional_data.emissions_off_site_transfer, data.emissions_off_site_transfer)
        self.assertEqual(report_additional_data.electricity_generated, data.electricity_generated)
        self.assertEqual(report_additional_data.report_version, self.report_version)
