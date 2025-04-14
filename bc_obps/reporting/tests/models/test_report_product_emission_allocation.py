from decimal import Decimal
import pytest
from django.core.exceptions import ValidationError
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportProductEmissionAllocationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.OTHER,
            allocation_other_methodology_description="Test description",
        )
        cls.test_object = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_version=facility_report.report_version,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("report_product", "report product", None, None),
            ("emission_category", "emission category", None, None),
            ("report_emission_allocation", "report emission allocation", None, None),
            ("allocated_quantity", "allocated quantity", None, None),
        ]

    def test_allow_null_description_if_methodology_is_not_other(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")

        with pytest.raises(
            ValidationError,
            match="A value for allocation_other_methodology_description must be provided if allocation_methodology is 'Other'",
        ):
            make_recipe(
                "reporting.tests.utils.report_emission_allocation",
                report_version=facility_report.report_version,
                facility_report=facility_report,
                allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.OTHER,
                allocation_other_methodology_description=None,
            )

        # This should not raise
        make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
            allocation_other_methodology_description=None,
        )

    def test_unique_allocation_per_report_product_and_emission_category(self):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make_recipe(
            'reporting.tests.utils.report_product',
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )

        report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=facility_report.report_version,
            facility_report=facility_report,
            allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
            allocation_other_methodology_description=None,
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=report_emission_allocation,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal("300.4151"),
        )

        with pytest.raises(
            ValidationError,
            match="A FacilityReport can only have one ReportEmissionAllocation per Report",
        ):
            report_emission_allocation = make_recipe(
                "reporting.tests.utils.report_emission_allocation",
                report_version=facility_report.report_version,
                facility_report=facility_report,
                allocation_methodology=ReportEmissionAllocation.AllocationMethodologyChoices.CALCULATOR,
                allocation_other_methodology_description=None,
            )
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_emission_allocation=report_emission_allocation,
                report_version=facility_report.report_version,
                report_product=report_product,
                emission_category=emission_category,
                allocated_quantity=Decimal("123.4321"),
            )

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_product_emission_allocation")
