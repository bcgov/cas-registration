from unittest.mock import patch

import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.reporting_flow_service import ReportingFlow
from reporting.service.report_validation.validators.required_fields.required_fields_report_review_facility_information import (
    REVIEW_FACILITIES_SECTION,
    REVIEW_FACILITIES_SECTION_TITLE,
    SECTION,
    SECTION_TITLE,
    applies,
    validate,
)


pytestmark = pytest.mark.django_db

BASE_PATH = (
    "reporting.service.report_validation.validators.required_fields."
    "required_fields_report_review_facility_information"
)

APPLIES_TO_SECTION_PATH = f"{BASE_PATH}.applies_to_section"
RESOLVE_FLOW_PATH = f"{BASE_PATH}.resolve_flow"


class TestRequiredFieldsReportReviewFacilityInformationValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.error_key = f"error_required_fields_{SECTION}"
        self.review_facilities_error_key = f"error_required_fields_{REVIEW_FACILITIES_SECTION}"

    def test_applies_returns_true_for_applicable_flow(self):
        assert applies(ReportingFlow.SFO) is True

    def test_applies_returns_false_for_non_applicable_flow(self):
        assert applies(ReportingFlow.EIO) is False

    def test_validate_returns_error_when_no_facility_reports_exist(self):
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
            "Facility name",
            "Facility type",
            "Activities",
        ]

    def test_validate_returns_error_when_required_fields_are_missing(self):
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=True,
        )

        type(facility_report).objects.filter(id=facility_report.id).update(
            facility_name="",
            facility_type="",
        )

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
        assert sorted(error.context.missing_fields) == sorted(
            [
                "Facility name",
                "Facility type",
                "Activities",
            ]
        )

    def test_validate_returns_review_facilities_error_when_lfo_facility_is_not_completed(
        self,
    ):
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=False,
        )

        activity = baker.make_recipe("reporting.tests.utils.activity")
        facility_report.activities.add(activity)

        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.LFO):
            result = validate(self.report_version)

        assert self.review_facilities_error_key in result
        assert self.error_key not in result

        error = result[self.review_facilities_error_key]

        assert isinstance(error, ReportValidationError)
        assert error.key == ReportValidationErrorKey.ERROR_REQUIRED_FIELDS
        assert error.severity == Severity.ERROR

        assert isinstance(error.context, ErrorContext)
        assert error.context.report_version_id == self.report_version.id
        assert error.context.section == REVIEW_FACILITIES_SECTION
        assert error.context.section_title == REVIEW_FACILITIES_SECTION_TITLE
        assert error.context.missing_fields == ["All facilities must be marked complete"]

    def test_validate_returns_both_errors_when_required_fields_are_missing_and_lfo_facility_is_not_completed(
        self,
    ):
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=False,
        )

        type(facility_report).objects.filter(id=facility_report.id).update(
            facility_name="",
            facility_type="",
        )

        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.LFO):
            result = validate(self.report_version)

        assert self.error_key in result
        assert self.review_facilities_error_key in result

    def test_validate_returns_empty_dict_when_lfo_facility_is_completed(self):
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=True,
        )

        activity = baker.make_recipe("reporting.tests.utils.activity")
        facility_report.activities.add(activity)

        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.LFO):
            result = validate(self.report_version)

        assert result == {}

    def test_validate_does_not_require_completion_for_non_lfo_flow(self):
        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            is_completed=False,
        )

        activity = baker.make_recipe("reporting.tests.utils.activity")
        facility_report.activities.add(activity)

        with patch(RESOLVE_FLOW_PATH, return_value=ReportingFlow.SFO):
            result = validate(self.report_version)

        assert result == {}
