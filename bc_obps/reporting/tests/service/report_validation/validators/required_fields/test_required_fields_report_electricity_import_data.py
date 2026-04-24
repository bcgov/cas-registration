from unittest.mock import patch

import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_electricity_import_data import (
    SECTION,
    SECTION_TITLE,
    applies,
    validate,
)

pytestmark = pytest.mark.django_db

BASE_PATH = (
    "reporting.service.report_validation.validators.required_fields.required_fields_report_electricity_import_data"
)
APPLIES_TO_SECTION_PATH = f"{BASE_PATH}.applies_to_section"


class TestRequiredFieldsReportElectricityImportDataValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.error_key = f"error_required_fields_{SECTION}"

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

    def test_validate_returns_error_when_electricity_import_data_is_missing(self):
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
            "Amount of imported electricity - specified sources",
            "Emissions from specified imports",
            "Amount of imported electricity - unspecified sources",
            "Emissions from unspecified imports",
            "Amount of exported electricity - specified sources",
            "Emissions from specified exports",
            "Amount of exported electricity - unspecified sources",
            "Emissions from unspecified exports",
            "Amount of electricity categorized as Canadian Entitlement Power",
            "Emissions from Canadian Entitlement Power",
        ]

    def test_validate_returns_empty_dict_when_required_fields_are_present(self):
        baker.make(
            "reporting.ReportElectricityImportData",
            report_version=self.report_version,
            import_specified_electricity=1.0,
            import_specified_emissions=2.0,
            import_unspecified_electricity=3.0,
            import_unspecified_emissions=4.0,
            export_specified_electricity=5.0,
            export_specified_emissions=6.0,
            export_unspecified_electricity=7.0,
            export_unspecified_emissions=8.0,
            canadian_entitlement_electricity=9.0,
            canadian_entitlement_emissions=10.0,
        )

        result = validate(self.report_version)

        assert result == {}

    def test_validate_returns_error_when_some_required_fields_are_missing(self):
        baker.make(
            "reporting.ReportElectricityImportData",
            report_version=self.report_version,
            import_specified_electricity=None,
            import_specified_emissions=2.0,
            import_unspecified_electricity=None,
            import_unspecified_emissions=4.0,
            export_specified_electricity=5.0,
            export_specified_emissions=None,
            export_unspecified_electricity=7.0,
            export_unspecified_emissions=8.0,
            canadian_entitlement_electricity=None,
            canadian_entitlement_emissions=10.0,
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
        assert error.context.missing_fields == [
            "Amount of imported electricity - specified sources",
            "Amount of imported electricity - unspecified sources",
            "Emissions from specified exports",
            "Amount of electricity categorized as Canadian Entitlement Power",
        ]
