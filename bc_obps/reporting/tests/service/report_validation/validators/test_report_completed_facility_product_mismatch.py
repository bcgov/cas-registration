from model_bakery.baker import make_recipe
import pytest
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators import report_completed_facility_product_mismatch


@pytest.mark.django_db
class TestReportCompletedFacilityProductMismatchValidator:
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation", report_version=self.report_version
        )
        self.selected_product, self.deselected_product = make_recipe(
            "registration.tests.utils.regulated_product", is_regulated=True, _quantity=2
        )
        self.report_operation.regulated_products.set([self.selected_product])
        self.completed_facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=True,
            facility_name="Completed Facility",
        )

    def _report_product(self, product, facility_report=None):
        return make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            facility_report=facility_report or self.completed_facility_report,
            product=product,
        )

    def _expected_error(self, product, facility_names):
        facilities = ", ".join(facility_names)
        return ReportValidationError(
            severity=Severity.ERROR,
            message=(
                f"{product.name} is not selected as a product on Review Operation Information "
                f"but is still selected on the {facilities} report. "
                "To proceed, either select the product on the Review Operation Information page, "
                f"or deselect them from {facilities} report."
            ),
            key=ReportValidationErrorKey.PRODUCT_NOT_IN_OPERATION_INFORMATION,
            context=ErrorContext(report_version_id=self.report_version.id),
        )

    def test_no_errors_without_report_operation(self):
        report_version = make_recipe("reporting.tests.utils.report_version")

        assert report_completed_facility_product_mismatch.validate(report_version) == {}

    def test_no_errors_when_reported_products_are_selected(self):
        self._report_product(self.selected_product)

        assert report_completed_facility_product_mismatch.validate(self.report_version) == {}

    def test_no_errors_for_incomplete_facility_report(self):
        incomplete_facility_report = make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.report_version, is_completed=False
        )
        self._report_product(self.deselected_product, incomplete_facility_report)

        assert report_completed_facility_product_mismatch.validate(self.report_version) == {}

    def test_no_error_for_unregulated_product_without_allocated_emissions(self):
        unregulated_product = make_recipe("registration.tests.utils.regulated_product", is_regulated=False)
        self._report_product(unregulated_product)

        assert report_completed_facility_product_mismatch.validate(self.report_version) == {}

    def test_one_error_per_deselected_product(self):
        unregulated_product = make_recipe("registration.tests.utils.regulated_product", is_regulated=False)
        self._report_product(self.selected_product)
        self._report_product(self.deselected_product)
        make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=self.report_version,
            report_product=self._report_product(unregulated_product),
            allocated_quantity=10,
        )

        result = report_completed_facility_product_mismatch.validate(self.report_version)

        assert result == {
            f"product_not_in_operation_information_product_{self.deselected_product.id}": self._expected_error(
                self.deselected_product, ["Completed Facility"]
            ),
            f"product_not_in_operation_information_product_{unregulated_product.id}": self._expected_error(
                unregulated_product, ["Completed Facility"]
            ),
        }
        
    def test_lists_all_completed_facility_reports_for_a_product(self):
        other_completed_facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=True,
            facility_name="A Completed Facility",
        )
        incomplete_facility_report = make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.report_version, is_completed=False
        )
        for facility_report in [
            self.completed_facility_report,
            other_completed_facility_report,
            incomplete_facility_report,
        ]:
            self._report_product(self.deselected_product, facility_report)

        result = report_completed_facility_product_mismatch.validate(self.report_version)

        assert result == {
            f"product_not_in_operation_information_product_{self.deselected_product.id}": self._expected_error(
                self.deselected_product, ["A Completed Facility", "Completed Facility"]
            )
        }