import pytest
from django.core.exceptions import ValidationError
from reporting.models.report_emission_allocation_no_product import (
    ReportEmissionAllocationNoProduct,
)
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportEmissionAllocationNoProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        cls.test_object = make(
            ReportEmissionAllocationNoProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology="Other",
            allocation_other_methodology_description="Test description",
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("allocation_methodology", "allocation methodology", 255, None),
            (
                "allocation_other_methodology_description",
                "allocation other methodology description",
                None,
                None,
            ),
        ]

    def test_allow_null_description_if_methodology_is_not_other(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")

        with pytest.raises(
            ValidationError,
            match="A value for allocation_other_methodology_description must be provided if allocation_methodology is 'Other'",
        ):
            make(
                ReportEmissionAllocationNoProduct,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                allocation_methodology=ReportEmissionAllocationNoProduct.AllocationMethodologyChoices.OTHER,
                allocation_other_methodology_description=None,
            )

        make(
            ReportEmissionAllocationNoProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocationNoProduct.AllocationMethodologyChoices.NOT_APPLICABLE,
            allocation_other_methodology_description=None,
        )

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_product_emission_allocation")
