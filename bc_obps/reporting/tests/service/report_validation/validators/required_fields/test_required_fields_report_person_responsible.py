from unittest.mock import patch

import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_person_responsible import (
    SECTION,
    SECTION_TITLE,
    applies,
    validate,
)

pytestmark = pytest.mark.django_db

BASE_PATH = "reporting.service.report_validation.validators.required_fields.required_fields_report_person_responsible"

RESOLVE_FLOW_PATH = f"{BASE_PATH}.resolve_flow"
SECTION_APPLICABLE_FLOWS_PATH = f"{BASE_PATH}.SECTION_APPLICABLE_FLOWS"


class TestRequiredFieldsReportPersonResponsibleValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.error_key = f"error_required_fields_{SECTION}"

    def test_applies_returns_true_when_flow_is_applicable(self):
        with (
            patch(RESOLVE_FLOW_PATH) as mock_resolve_flow,
            patch(SECTION_APPLICABLE_FLOWS_PATH, {SECTION: {"test_flow"}}),
        ):
            mock_resolve_flow.return_value = "test_flow"

            assert applies(self.report_version) is True

    def test_applies_returns_false_when_flow_is_not_applicable(self):
        with (
            patch(RESOLVE_FLOW_PATH) as mock_resolve_flow,
            patch(SECTION_APPLICABLE_FLOWS_PATH, {SECTION: {"test_flow"}}),
        ):
            mock_resolve_flow.return_value = "other_flow"

            assert applies(self.report_version) is False

    def test_validate_returns_error_when_report_person_responsible_does_not_exist(self):
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
            "First name",
            "Last name",
            "Business email address",
            "Business telephone number",
            "Business mailing address",
            "Municipality",
            "Province",
            "Postal code",
            "Job title / position",
        ]

    def test_validate_returns_empty_dict_when_required_fields_are_present(self):
        baker.make_recipe(
            "reporting.tests.utils.report_person_responsible",
            report_version=self.report_version,
            first_name="John",
            last_name="Doe",
            email="john.doe@test.com",
            phone_number="+16044011234",
            street_address="123 Main St",
            municipality="Vancouver",
            province="BC",
            postal_code="A1A1A1",
            business_role="Manager",
        )

        result = validate(self.report_version)

        assert result == {}
