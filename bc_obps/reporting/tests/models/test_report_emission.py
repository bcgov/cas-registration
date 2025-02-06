from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from django.core.exceptions import ValidationError


class ReportEmissionModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.report_emission")
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("gas_type", "gas type", None, None),
            ("report_source_type", "report source type", None, None),
            ("report_fuel", "report fuel", None, None),
            ("report_unit", "report unit", None, None),
            ("report_methodology", "report methodology", None, None),
            ("emission_categories", "emission categories", None, 0),
        ]

    def test_cannot_have_unit_and_fuel(self):
        # Valid case: no unit, no fuel
        report_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_fuel=None,
            report_unit=None,
        )

        report_fuel = make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=report_emission.report_source_type,
            report_version=report_emission.report_version,
        )

        report_unit = make_recipe(
            "reporting.tests.utils.report_unit",
            report_source_type=report_emission.report_source_type,
            report_version=report_emission.report_version,
        )

        # Valid case: fuel and no unit

        report_emission.report_fuel = report_fuel
        report_emission.save()

        # Valid case: unit and no fuel

        report_emission.report_fuel = None
        report_emission.report_unit = report_unit
        report_emission.save()

        # Error case: both unit and fuel

        with pytest.raises(
            ValidationError,
            match="An emission record must belong to either a fuel, a unit, or none, but not both",
        ):
            report_emission.report_fuel = report_fuel
            report_emission.report_unit = report_unit
            report_emission.save()
