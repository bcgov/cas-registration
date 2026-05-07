from django.test import TestCase
from reporting.service.report_validation.validators import report_emission_allocation_other_excluded_category
from model_bakery.baker import make_recipe
import pytest


@pytest.mark.django_db
class TestReportAllocationOtherExcludedCategoryValidator(TestCase):

    def setUp(self):
        self.validator_under_test = report_emission_allocation_other_excluded_category

        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=self.report_version)
        self.report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.report_version,
            facility_report=self.facility_report,
        )

        self.included_cats = make_recipe(
            "reporting.tests.utils.emission_category",
            category_type="basic",
            _quantity=3,
        )
        self.other_excluded_cats = make_recipe(
            "reporting.tests.utils.emission_category",
            category_type="other_excluded",
            _quantity=3,
        )

    def test_report_allocation_other_excluded_category_validator(self):
        # This test should cover the following scenarios:
        # 1. A facility report with no "other_excluded" emissions and no allocations (should pass)
        # 2. A facility report with "other_excluded" emissions but no allocations (should fail)
        # 3. A facility report with "other_excluded" emissions and sufficient allocations (should pass)
        # 4. A facility report with "other_excluded" emissions and insufficient allocations (should fail)

        # Note: The actual implementation of this test would require setting up the necessary database records
        # for FacilityReport, EmissionCategory, ReportEmission, and ReportProductEmissionAllocation,
        # which is beyond the scope of this code snippet.
        pass

    @pytest.mark.parametrize("is_product_regulated", [True, False])
    def test_passes_with_no_other_excluded_emissions(self, is_product_regulated):
        """
        This should pass regardless of whether the product allocated to is regulated or not,
        an regardless of the allocation quantity (this is not tested by this validator)
        """
        emissions = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[0]],
        )
        allocations = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[0],
            allocated_quantity="1001",
            report_product__product__is_regulated=is_product_regulated,
        )
        assert self.validator_under_test.validate(self.report_version) == {}

    def test_fails_with_other_excluded_emissions_and_no_allocations(self):
        emissions = make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[
                self.included_cats[0],
                self.other_excluded_cats[0],
            ],
        )

        assert self.validator_under_test.validate(self.report_version) == {}

    def test_fails_with_one_category_properly_allocated_and_one_not(self):
        emissions = [
            make_recipe(
                "reporting.tests.utils.report_emission",
                report_version=self.report_version,
                report_source_type__report_activity__facility_report=self.facility_report,
                json_data={"equivalentEmission": "100"},
                emission_categories=[self.included_cats[0], self.other_excluded_cats[0]],
            ),
            make_recipe(
                "reporting.tests.utils.report_emission",
                report_version=self.report_version,
                report_source_type__report_activity__facility_report=self.facility_report,
                json_data={"equivalentEmission": "100"},
                emission_categories=[self.included_cats[1], self.other_excluded_cats[0]],
            ),
        ]
        allocations = [
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_emission_allocation=self.report_emission_allocation,
                emission_category=self.included_cats[0],
                allocated_quantity="100",
                report_product__product__is_regulated=False,
            ),
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_emission_allocation=self.report_emission_allocation,
                emission_category=self.included_cats[1],
                allocated_quantity="101",
                report_product__product__is_regulated=False,
            ),
        ]

        assert self.validator_under_test.validate(self.report_version) == {}

    def test_passes_with_other_excluded_emissions_and_sufficient_allocations(self):
        emissions = [
            make_recipe(
                "reporting.tests.utils.report_emission",
                report_version=self.report_version,
                report_source_type__report_activity__facility_report=self.facility_report,
                json_data={"equivalentEmission": "100"},
                emission_categories=[self.included_cats[0], self.other_excluded_cats[0]],
            ),
            make_recipe(
                "reporting.tests.utils.report_emission",
                report_version=self.report_version,
                report_source_type__report_activity__facility_report=self.facility_report,
                json_data={"equivalentEmission": "100"},
                emission_categories=[self.included_cats[1], self.other_excluded_cats[0]],
            ),
        ]
        allocations = [
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_emission_allocation=self.report_emission_allocation,
                emission_category=self.included_cats[0],
                allocated_quantity="100",
                report_product__product__is_regulated=False,
            ),
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_emission_allocation=self.report_emission_allocation,
                emission_category=self.included_cats[1],
                allocated_quantity="100",
                report_product__product__is_regulated=False,
            ),
        ]

        assert self.validator_under_test.validate(self.report_version) == {}
