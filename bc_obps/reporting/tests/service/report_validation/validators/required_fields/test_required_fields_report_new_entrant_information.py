import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_new_entrant_information import (
    RequiredFieldsNewEntrantInformationValidator,
    applies,
    validate,
)
from reporting.service.reporting_flow_service import ReportingFlow


pytestmark = pytest.mark.django_db

SECTION = RequiredFieldsNewEntrantInformationValidator.SECTION
SECTION_TITLE = RequiredFieldsNewEntrantInformationValidator.SECTION_TITLE

BASE_PATH = (
    "reporting.service.report_validation.validators.required_fields.required_fields_report_new_entrant_information"
)
APPLIES_TO_SECTION_PATH = f"{BASE_PATH}.applies_to_section"


class TestRequiredFieldsReportNewEntrantInformationValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.error_key = f"error_required_fields_{SECTION}"

    def test_applies_returns_true_for_applicable_flow(self):
        assert applies(ReportingFlow.NEW_ENTRANT_SFO) is True

    def test_applies_returns_false_for_non_applicable_flow(self):
        assert applies(ReportingFlow.EIO) is False

    def test_validate_returns_error_when_report_new_entrant_does_not_exist(self):
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
        assert error.context.missing_fields == [
            "Authorization date",
            "Date of first shipment",
            "Date new entrant period began",
        ]

    def test_validate_returns_empty_dict_when_required_fields_are_present(self):
        baker.make_recipe(
            "reporting.tests.utils.report_new_entrant",
            report_version=self.report_version,
        )

        result = validate(self.report_version)

        assert result == {}
