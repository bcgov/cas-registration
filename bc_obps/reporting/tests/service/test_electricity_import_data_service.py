from decimal import Decimal
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models import ElectricityImportData
from reporting.service.electricity_import_data_service import ElectricityImportDataService, ElectricityImportFormData


class TestElectricityImportDataService(TestCase):
    DECIMAL_STRING_PAYLOAD = {
        "import_specified_electricity": '0.05',
        "import_specified_emissions": '0.05',
        "import_unspecified_electricity": '0.05',
        "import_unspecified_emissions": '0.05',
        "export_specified_electricity": '0.05',
        "export_specified_emissions": '0.05',
        "export_unspecified_electricity": '0.05',
        "export_unspecified_emissions": '0.05',
        "canadian_entitlement_electricity": '0.05',
        "canadian_entitlement_emissions": '0.05',
    }

    INTEGER_PAYLOAD = {
        "import_specified_electricity": 5,
        "import_specified_emissions": 10,
        "import_unspecified_electricity": 15,
        "import_unspecified_emissions": 20,
        "export_specified_electricity": 25,
        "export_specified_emissions": 30,
        "export_unspecified_electricity": 35,
        "export_unspecified_emissions": 40,
        "canadian_entitlement_electricity": 45,
        "canadian_entitlement_emissions": 50,
    }

    ZERO_PAYLOAD = {field: 0 for field in DECIMAL_STRING_PAYLOAD.keys()}
    NONE_PAYLOAD = {field: None for field in DECIMAL_STRING_PAYLOAD.keys()}

    def setUp(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')

    def _save_and_assert(self, input_data: dict):
        """Helper to test save logic with different input types."""
        form_data = ElectricityImportFormData(**input_data)

        result = ElectricityImportDataService.save_electricity_import_data(
            version_id=self.report_version.id,
            payload=form_data,
        )

        self.assertIsNotNone(result)
        self.assertIsInstance(result, ElectricityImportData)
        self.assertEqual(result.report_version, self.report_version)

        for field, value in input_data.items():
            with self.subTest(field=field):
                expected = None if value is None else Decimal(str(value))
                self.assertEqual(getattr(result, field), expected)

    def test_save_with_decimal_strings(self):
        """Should save correctly with decimal string inputs."""
        self._save_and_assert(self.DECIMAL_STRING_PAYLOAD)

    def test_save_with_integers(self):
        """Should save correctly with integer inputs."""
        self._save_and_assert(self.INTEGER_PAYLOAD)

    def test_save_with_zeros(self):
        """Should save correctly when all fields are zero."""
        self._save_and_assert(self.ZERO_PAYLOAD)

    def test_save_with_none_for_optional_fields(self):
        self._save_and_assert(self.NONE_PAYLOAD)

    def test_get_electricity_import_data(self):
        expected_data = make_recipe('reporting.tests.utils.electricity_import_data', report_version=self.report_version)

        retrieved = ElectricityImportDataService.get_electricity_import_data(report_version_id=self.report_version.id)

        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.report_version.id, self.report_version.id)

        fields = [
            "import_specified_electricity",
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

        for field in fields:
            with self.subTest(field=field):
                self.assertEqual(getattr(retrieved, field), getattr(expected_data, field))
