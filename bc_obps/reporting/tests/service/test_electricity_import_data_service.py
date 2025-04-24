from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.schema.electricity_import_data import ElectricityImportDataIn
from reporting.service.electricity_import_data_service import ElectricityImportDataService


class TestReportVerificationService(TestCase):
    def setUp(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')

    def test_save_electricity_import_saves_record(self):
        """
        Test that the service updates or creates ElectricityImportData instance
        for a given report version ID.
        """

        # Arrange: Prepare input data
        data = ElectricityImportDataIn(
            import_specified_electricity='0.05',
            import_specified_emissions='0.05',
            import_unspecified_electricity='0.05',
            import_unspecified_emissions='0.05',
            export_specified_electricity='0.05',
            export_specified_emissions='0.05',
            export_unspecified_electricity='0.05',
            export_unspecified_emissions='0.05',
            canadian_entitlement_electricity='0.05',
            canadian_entitlement_emissions='0.05',
        )

        electricity_import = ElectricityImportDataService.save_electricity_import_data(
            version_id=self.report_version.id,
            data=data,
        )

        fields_to_check = [
            "import_specified_emissions",
            "import_unspecified_electricity",
            "import_unspecified_emissions",
            "export_specified_electricity",
            "export_specified_emissions",
            "export_unspecified_electricity",
            "export_unspecified_emissions",
            "canadian_entitlement_electricity",
            "canadian_entitlement_emissions",
        ]
        self.assertIsNotNone(electricity_import)
        self.assertEqual(electricity_import.report_version, self.report_version)

        for field in fields_to_check:
            self.assertEqual(Decimal(getattr(electricity_import, field)), Decimal(getattr(data, field)))
