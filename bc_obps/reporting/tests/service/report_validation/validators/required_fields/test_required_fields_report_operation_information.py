import pytest
from model_bakery import baker
from unittest.mock import patch

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_operation_information import (
    RequiredFieldsReportOperationInformationValidator,
    applies,
    validate,
)
from reporting.service.reporting_flow_service import ReportingFlow


pytestmark = pytest.mark.django_db

BASE_PATH = (
    "reporting.service.report_validation.validators.required_fields.required_fields_report_operation_information"
)
RESOLVE_FLOW_PATH = f"{BASE_PATH}.resolve_flow"

SECTION = RequiredFieldsReportOperationInformationValidator.SECTION
SECTION_TITLE = RequiredFieldsReportOperationInformationValidator.SECTION_TITLE


class TestRequiredFieldsReportOperationInformationValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.error_key = f"error_required_fields_{SECTION}"

    def test_applies_returns_true_for_applicable_flow(self):
        assert applies(ReportingFlow.SFO) is True

    def test_validate_returns_error_when_report_operation_does_not_exist(self):
        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.SFO):
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
            "Operation name",
            "Operator legal name",
            "Activities",
            "Operation representative name",
        ]

    def test_validate_returns_error_when_report_operation_does_not_exist_for_eio(self):
        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.EIO):
            result = validate(self.report_version)

        assert self.error_key in result

        error = result[self.error_key]

        assert error.context.missing_fields == [
            "Operation name",
            "Operator legal name",
            "Operation representative name",
        ]

    def test_validate_returns_empty_dict_when_required_fields_are_present(self):
        report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
        )

        activity = baker.make_recipe("reporting.tests.utils.activity")
        regulated_product = baker.make_recipe("reporting.tests.utils.regulated_product")

        report_operation.activities.add(activity)
        report_operation.regulated_products.add(regulated_product)

        baker.make_recipe(
            "reporting.tests.utils.report_operation_representative",
            report_version=self.report_version,
            selected_for_report=True,
        )

        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.SFO):
            result = validate(self.report_version)

        assert result == {}
