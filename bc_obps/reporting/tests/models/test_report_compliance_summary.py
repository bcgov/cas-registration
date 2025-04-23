from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportComplianceSummary
from model_bakery import baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from decimal import Decimal


class ReportComplianceSummaryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        rv = baker.make_recipe('reporting.tests.utils.report_version')

        cls.test_object = ReportComplianceSummary.objects.create(
            report_version=rv,
            emissions_attributable_for_reporting=1000,
            reporting_only_emissions=500,
            emissions_attributable_for_compliance=500,
            emissions_limit=100,
            excess_emissions=400,
            credited_emissions=0,
            reduction_factor=Decimal("0.6500"),
            tightening_rate=Decimal("0.0100"),
            compliance_period=2024,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("emissions_attributable_for_reporting", "emissions attributable for reporting", None, None),
            ("reporting_only_emissions", "reporting only emissions", None, None),
            ("emissions_attributable_for_compliance", "emissions attributable for compliance", None, None),
            ("emissions_limit", "emissions limit", None, None),
            ("excess_emissions", "excess emissions", None, None),
            ("credited_emissions", "credited emissions", None, None),
            ("reduction_factor", "reduction factor", None, None),
            ("tightening_rate", "tightening rate", None, None),
            ("initial_compliance_period", "initial compliance period", None, None),
            ("compliance_period", "compliance period", None, None),
            (
                "report_compliance_summary_products",
                "report compliance summary product",
                None,
                0,
            ),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_compliance_summary",
            "emissions_attributable_for_reporting",
            decimal_value_to_update=Decimal('444.0'),
        )
