from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models import ElectricityImportData
from reporting.service.report_electricity_import_data_service import (
    ElectricityImportDataService,
    ElectricityImportFormData,
)


class TestElectricityImportDataService(TestCase):
    TEST_PAYLOAD = {
        "import_specified_electricity": '0.05',
        "import_specified_emissions": 0,
        "import_unspecified_electricity": 9,
        "import_unspecified_emissions": None,
        "export_specified_electricity": '123456789.123',
        "export_specified_emissions": 42,
        "export_unspecified_electricity": '0',
        "export_unspecified_emissions": '0.0001',
        "canadian_entitlement_electricity": None,
        "canadian_entitlement_emissions": 1000000,
    }

    def setUp(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')

    def _save_and_assert(self, input_data: dict):
        form_data = ElectricityImportFormData(**input_data)
        result = ElectricityImportDataService.save_electricity_import_data(
            version_id=self.report_version.id, payload=form_data
        )

        self.assertIsNotNone(result)
        self.assertIsInstance(result, ElectricityImportData)
        self.assertEqual(result.report_version, self.report_version)

        for field, value in input_data.items():
            expected = None if value is None else Decimal(str(value))
            self.assertEqual(getattr(result, field), expected)

    def test_save_electricity_import_data(self):
        self._save_and_assert(self.TEST_PAYLOAD)

    def test_get_electricity_import_data(self):
        expected_data = make_recipe('reporting.tests.utils.electricity_import_data', report_version=self.report_version)
        retrieved = ElectricityImportDataService.get_electricity_import_data(report_version_id=self.report_version.id)

        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.report_version.id, self.report_version.id)

        for field in self.TEST_PAYLOAD.keys():
            self.assertEqual(getattr(retrieved, field), getattr(expected_data, field))
