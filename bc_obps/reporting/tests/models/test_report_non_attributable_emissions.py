from model_bakery import baker

from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportNonAttributableEmissions, GasType, EmissionCategory
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportNonAttributableEmissionsModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.emission_category = EmissionCategory.objects.create(category_name="Default Category", category_type="basic")
        cls.gas_type = GasType.objects.create(
            name="Default Gas", chemical_formula="H2O", cas_number="124-38-9", gwp=100
        )
        cls.test_object = ReportNonAttributableEmissions.objects.create(
            activity="activity",
            source_type="source_type",
            report_version=report_version_baker(report_operation=None),
            emission_category=cls.emission_category,
            facility_report=baker.make_recipe("reporting.tests.utils.facility_report"),
        )
        cls.test_object.gas_type.add(cls.gas_type)
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("activity", "activity", None, None),
            ("source_type", "source type", None, None),
            ("gas_type", "gas type", None, None),
            ("emission_category", "emission category", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_non_attributable_emissions")
