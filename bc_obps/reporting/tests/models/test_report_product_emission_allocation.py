from decimal import Decimal
import pytest
from django.core.exceptions import ValidationError
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product_emission_allocation import (
    ReportProductEmissionAllocation,
)
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_product import ReportProduct
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportProductEmissionAllocationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        cls.test_object = make(
            ReportProductEmissionAllocation,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
            allocation_methodology="Other",
            allocation_other_methodology_description="Test description",
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("report_product", "report product", None, None),
            ("emission_category", "emission category", None, None),
            ("allocated_quantity", "allocated quantity", None, None),
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
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )

        with pytest.raises(
            ValidationError,
            match="A value for allocation_other_methodology_description must be provided if the allocation_methodology is 'Other'",
        ):
            make(
                ReportProductEmissionAllocation,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                report_product=report_product,
                emission_category=emission_category,
                allocated_quantity=Decimal("300.4151"),
                allocation_methodology=ReportProductEmissionAllocation.AllocationMethodologyChoices.OTHER,
                allocation_other_methodology_description=None,
            )

        # This should not raise
        make(
            ReportProductEmissionAllocation,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
            allocation_methodology=ReportProductEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
            allocation_other_methodology_description=None,
        )

    def test_unique_allocation_per_report_product_and_emission_category(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )

        make(
            ReportProductEmissionAllocation,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
            allocation_methodology=ReportProductEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
            allocation_other_methodology_description=None,
        )

        with pytest.raises(
            ValidationError,
            match="Report product emission allocation with this Report version, Facility report, Report product and Emission category already exists.",
        ):
            make(
                ReportProductEmissionAllocation,
                report_version=facility_report.report_version,
                facility_report=facility_report,
                report_product=report_product,
                emission_category=emission_category,
                allocated_quantity=Decimal("123.4321"),
                allocation_methodology=ReportProductEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
                allocation_other_methodology_description=None,
            )

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_product_emission_allocation")
