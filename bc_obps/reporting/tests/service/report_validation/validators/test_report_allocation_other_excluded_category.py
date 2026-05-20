from model_bakery.utils import seq
from reporting.models.emission_category import EmissionCategory
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators import report_emission_allocation_other_excluded_category
from model_bakery.baker import make_recipe
import pytest


@pytest.mark.django_db
class TestReportAllocationOtherExcludedCategoryValidator:

    def setup_method(self):
        self.validator_under_test = report_emission_allocation_other_excluded_category

        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_name="Test Facility",
        )
        self.report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.report_version,
            facility_report=self.facility_report,
        )

        self.included_cats = make_recipe(
            "reporting.tests.utils.emission_category",
            category_type="basic",
            category_name=seq("Included Category "),
            _quantity=3,
        )
        self.other_excluded_cats = make_recipe(
            "reporting.tests.utils.emission_category",
            category_type="other_excluded",
            category_name=seq("Other Excluded Category "),
            _quantity=3,
        )

    def assert_error(self, errors: dict[str, ReportValidationError], category: EmissionCategory) -> None:
        error = errors[f"og_np_nc_allocation_mismatch_{self.facility_report.facility_id}_{category.category_name}"]
        assert error.key == ReportValidationErrorKey.OG_NP_NC_ALLOCATION_MISMATCH
        assert error.severity == Severity.WARNING
        assert (
            error.message
            == f"For the emission category '{category.category_name}', emissions allocated to the O&G non-processing, "
            "non-combustion product exceed the emissions reported under the 'other_excluded' category."
        )
        assert error.context.facility_id == self.facility_report.facility_id
        assert error.context.facility_name == self.facility_report.facility_name
        assert error.context.report_version_id == self.report_version.id

    def test_passes_if_product_is_regulated(self):
        """
        This should pass regardless of the allocation quantity (this is not tested by this validator)
        """
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[0]],
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[0],
            allocated_quantity="1001",
            report_product__product__is_regulated=True,
        )
        assert self.validator_under_test.validate(self.report_version) == {}

    def test_fails_if_no_other_excluded_emissions(self):
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[0]],
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[0],
            allocated_quantity="1001",
            report_product__product__is_regulated=False,
        )
        errors = self.validator_under_test.validate(self.report_version)
        assert len(errors.keys()) == 1
        self.assert_error(errors, self.included_cats[0])

    def test_passes_with_other_excluded_emissions_and_no_allocations(self):
        """
        This validator only checks for over-allocation of individual categories
        """
        make_recipe(
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

        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[0], self.other_excluded_cats[0]],
        )
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[1], self.other_excluded_cats[0]],
        )

        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[0],
            allocated_quantity="100",
            report_product__product__is_regulated=False,
        )

        # Included Category 1 is over-allocated
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[1],
            allocated_quantity="101",
            report_product__product__is_regulated=False,
        )

        errors = self.validator_under_test.validate(self.report_version)
        assert len(errors.keys()) == 1
        self.assert_error(errors, self.included_cats[1])

    def test_passes_with_other_excluded_emissions_and_sufficient_allocations(self):
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[0], self.other_excluded_cats[0]],
        )
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[1], self.other_excluded_cats[0]],
        )

        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[0],
            allocated_quantity="100",
            report_product__product__is_regulated=False,
        )
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[1],
            allocated_quantity="100",
            report_product__product__is_regulated=False,
        )

        assert self.validator_under_test.validate(self.report_version) == {}

    def test_fails_with_multiple_categories_over_allocated(self):
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[0], self.other_excluded_cats[0]],
        )
        make_recipe(
            "reporting.tests.utils.report_emission",
            report_version=self.report_version,
            report_source_type__report_activity__facility_report=self.facility_report,
            json_data={"equivalentEmission": "100"},
            emission_categories=[self.included_cats[1], self.other_excluded_cats[0]],
        )

        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[0],
            allocated_quantity="200",
            report_product__product__is_regulated=False,
        )

        # Included Category 1 is over-allocated
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_emission_allocation=self.report_emission_allocation,
            emission_category=self.included_cats[1],
            allocated_quantity="3999",
            report_product__product__is_regulated=False,
        )

        errors = self.validator_under_test.validate(self.report_version)
        assert len(errors.keys()) == 2
        self.assert_error(errors, self.included_cats[0])
        self.assert_error(errors, self.included_cats[1])
