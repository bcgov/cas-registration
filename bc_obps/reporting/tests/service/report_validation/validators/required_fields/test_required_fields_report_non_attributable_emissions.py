import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.required_fields_report_non_attributable_emissions import (
    RequiredFieldsNonAttributableEmissionsValidator,
    applies,
    validate,
)
from reporting.service.reporting_flow_service import ReportingFlow

pytestmark = pytest.mark.django_db

SECTION = RequiredFieldsNonAttributableEmissionsValidator.SECTION
SECTION_TITLE = RequiredFieldsNonAttributableEmissionsValidator.SECTION_TITLE


class TestRequiredFieldsReportNonAttributableEmissionsValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_name="Test Facility",
        )
        self.error_key = f"error_required_fields_{SECTION}_facility_{self.facility_report.facility_id}"

    def test_applies_returns_true_when_flow_is_applicable(self):
        assert applies(ReportingFlow.SFO) is True

    def test_applies_returns_false_when_flow_is_not_applicable(self):
        assert applies(ReportingFlow.EIO) is False

    def test_validate_returns_empty_dict_when_facility_has_no_non_attributable_emissions(self):
        result = validate(self.report_version)

        assert result == {}

    def test_validate_returns_error_when_required_fields_missing(self):
        record = baker.make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions",
            report_version=self.report_version,
            facility_report=self.facility_report,
        )

        type(record).objects.filter(id=record.id).update(
            activity="",
            source_type="",
        )

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
        assert sorted(error.context.missing_fields) == sorted(
            [
                "Activity name",
                "Source type",
            ]
        )

    def test_validate_returns_empty_dict_when_required_fields_are_present(self):
        report_non_attributable_emissions = baker.make_recipe(
            "reporting.tests.utils.report_non_attributable_emissions",
            report_version=self.report_version,
            facility_report=self.facility_report,
        )
        gas_type = baker.make_recipe("reporting.tests.utils.gas_type")
        report_non_attributable_emissions.gas_type.add(gas_type)

        result = validate(self.report_version)

        assert result == {}
