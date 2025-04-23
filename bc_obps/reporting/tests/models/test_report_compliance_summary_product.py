from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportComplianceSummaryProduct
from model_bakery import baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from decimal import Decimal


class ReportComplianceSummaryModelProductTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        rv = baker.make_recipe('reporting.tests.utils.report_version')
        rcs = baker.make_recipe('reporting.tests.utils.report_compliance_summary')
        p = baker.make_recipe('registration.tests.utils.regulated_product')

        cls.test_object = ReportComplianceSummaryProduct.objects.create(
            report_version=rv,
            report_compliance_summary=rcs,
            product=p,
            annual_production=100,
            apr_dec_production=50,
            emission_intensity=0.5,
            allocated_industrial_process_emissions=25,
            allocated_compliance_emissions=50,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("report_compliance_summary", "report compliance summary", None, None),
            ("product", "product", None, None),
            ("annual_production", "annual production", None, None),
            ("apr_dec_production", "apr dec production", None, None),
            ("emission_intensity", "emission intensity", None, None),
            ("allocated_industrial_process_emissions", "allocated industrial process emissions", None, None),
            ("allocated_compliance_emissions", "allocated compliance emissions", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_compliance_summary_product",
            "annual_production",
            decimal_value_to_update=Decimal('444.0'),
        )
