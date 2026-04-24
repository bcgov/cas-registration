from unittest.mock import patch

import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_production_data import (
    SECTION,
    SECTION_TITLE,
    applies,
    validate,
)

pytestmark = pytest.mark.django_db

BASE_PATH = "reporting.service.report_validation.validators.required_fields.required_fields_report_production_data"
APPLIES_TO_SECTION_PATH = f"{BASE_PATH}.applies_to_section"


class TestRequiredFieldsReportProductionDataValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_name="Test Facility",
        )
        self.error_key = f"error_required_fields_{SECTION}_facility_{self.facility_report.facility_id}"

    def test_applies_returns_true_when_flow_is_applicable(self):
        with patch(APPLIES_TO_SECTION_PATH, return_value=True) as mock_applies:
            result = applies(self.report_version)

        assert result is True
        mock_applies.assert_called_once_with(self.report_version, SECTION)

    def test_applies_returns_false_when_flow_is_not_applicable(self):
        with patch(APPLIES_TO_SECTION_PATH, return_value=False) as mock_applies:
            result = applies(self.report_version)

        assert result is False
        mock_applies.assert_called_once_with(self.report_version, SECTION)

    def test_validate_returns_error_when_facility_has_no_products(self):
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

    def test_validate_returns_empty_dict_when_required_fields_are_present(self):
        baker.make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.report_version,
            facility_report=self.facility_report,
            annual_production=100,
            production_data_apr_dec=50,
        )

        result = validate(self.report_version)

        assert result == {}
