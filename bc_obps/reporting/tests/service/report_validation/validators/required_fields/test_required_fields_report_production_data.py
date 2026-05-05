import pytest
from model_bakery import baker
from unittest.mock import patch

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_production_data import (
    RequiredFieldsProductionDataValidator,
    applies,
    validate,
)
from reporting.service.reporting_flow_service import ReportingFlow


pytestmark = pytest.mark.django_db

SECTION = RequiredFieldsProductionDataValidator.SECTION
SECTION_TITLE = RequiredFieldsProductionDataValidator.SECTION_TITLE

BASE_PATH = "reporting.service.report_validation.validators.required_fields.required_fields_report_production_data"
GET_ALLOWED_PRODUCTS_PATH = f"{BASE_PATH}.ReportProductService.get_allowed_products"


class TestRequiredFieldsReportProductionDataValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_name="Test Facility",
        )
        self.error_key = f"error_required_fields_{SECTION}_facility_{self.facility_report.facility_id}"

    def test_applies_returns_true_for_applicable_flow(self):
        assert applies(ReportingFlow.SFO) is True

    def test_applies_returns_false_for_non_applicable_flow(self):
        assert applies(ReportingFlow.EIO) is False

    @patch(GET_ALLOWED_PRODUCTS_PATH)
    def test_validate_returns_error_when_facility_has_no_products(self, mock_allowed_products):
        mock_allowed_products.return_value = [baker.make_recipe("reporting.tests.utils.regulated_product")]

        result = validate(self.report_version)

        assert self.error_key in result

        error = result[self.error_key]

        assert isinstance(error, ReportValidationError)
        assert error.key == ReportValidationErrorKey.ERROR_REQUIRED_FIELDS
        assert error.severity == Severity.ERROR

        assert isinstance(error.context, ErrorContext)
        assert error.context.report_version_id == self.report_version.id
        assert error.context.facility_id == self.facility_report.facility_id
        assert error.context.facility_name == self.facility_report.facility_name
        assert error.context.section == SECTION
        assert error.context.section_title == SECTION_TITLE
        assert error.context.missing_fields == [
            "Product",
            "Annual production",
            "Production methodology",
        ]

    @patch(GET_ALLOWED_PRODUCTS_PATH)
    def test_validate_returns_empty_dict_when_required_fields_are_present(self, mock_allowed_products):
        product = baker.make_recipe("reporting.tests.utils.regulated_product")
        mock_allowed_products.return_value = [product]

        baker.make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            facility_report=self.facility_report,
            product=product,
            annual_production=100,
            production_data_apr_dec=50,
        )

        result = validate(self.report_version)

        assert result == {}

    @patch(GET_ALLOWED_PRODUCTS_PATH)
    def test_validate_skips_when_no_allowed_products(self, mock_allowed_products):
        mock_allowed_products.return_value = []

        result = validate(self.report_version)

        assert result == {}
