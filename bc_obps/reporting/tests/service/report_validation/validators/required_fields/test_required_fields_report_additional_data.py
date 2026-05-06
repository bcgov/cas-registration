import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_additional_data import (
    RequiredFieldsAdditionalReportingDataValidator,
    applies,
    validate,
)
from reporting.service.reporting_flow_service import ReportingFlow


pytestmark = pytest.mark.django_db

SECTION = RequiredFieldsAdditionalReportingDataValidator.SECTION
SECTION_TITLE = RequiredFieldsAdditionalReportingDataValidator.SECTION_TITLE

BASE_PATH = "reporting.service.report_validation.validators.required_fields.required_fields_report_additional_data"
APPLIES_TO_SECTION_PATH = f"{BASE_PATH}.applies_to_section"


class TestRequiredFieldsReportAdditionalDataValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.error_key = f"error_required_fields_{SECTION}"

    def test_applies_returns_true_for_applicable_flow(self):
        assert applies(ReportingFlow.SFO) is True

    def test_applies_returns_false_for_non_applicable_flow(self):
        assert applies(ReportingFlow.EIO) is False

    def test_validate_returns_error_when_report_additional_data_does_not_exist(self):
        result = validate(self.report_version)

        assert self.error_key in result

        error = result[self.error_key]

        assert isinstance(error, ReportValidationError)
        assert error.key == ReportValidationErrorKey.ERROR_REQUIRED_FIELDS
        assert error.severity == Severity.ERROR

        assert isinstance(error.context, ErrorContext)
        assert error.context.report_version_id == self.report_version.id
        assert error.context.section == SECTION
        assert error.context.section_title == SECTION_TITLE
        assert error.context.missing_fields == [SECTION_TITLE]

    def test_validate_returns_error_when_capture_emissions_fields_are_missing(self):
        baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.report_version,
            capture_emissions=True,
            emissions_on_site_use=None,
            emissions_on_site_sequestration=None,
            emissions_off_site_transfer=None,
        )

        result = validate(self.report_version)

        assert self.error_key in result

        error = result[self.error_key]

        assert isinstance(error, ReportValidationError)
        assert error.key == ReportValidationErrorKey.ERROR_REQUIRED_FIELDS
        assert error.severity == Severity.ERROR

        assert isinstance(error.context, ErrorContext)
        assert error.context.report_version_id == self.report_version.id
        assert error.context.section == SECTION
        assert error.context.section_title == SECTION_TITLE
        assert error.context.missing_fields == ["At least one emissions capture type must be provided"]

    def test_validate_returns_empty_dict_when_capture_emissions_is_false(self):
        baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.report_version,
            capture_emissions=False,
            emissions_on_site_use=None,
            emissions_on_site_sequestration=None,
            emissions_off_site_transfer=None,
        )

        result = validate(self.report_version)

        assert result == {}

    def test_validate_returns_empty_dict_when_capture_emissions_fields_are_present(self):
        baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.report_version,
            capture_emissions=True,
            emissions_on_site_use=10,
            emissions_on_site_sequestration=20,
            emissions_off_site_transfer=30,
        )

        result = validate(self.report_version)

        assert result == {}
