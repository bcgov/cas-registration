from unittest.mock import patch

import pytest
from model_bakery import baker

from reporting.service.report_validation.report_validation_error import (
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.activity_data_coverage_validator import (
    SECTION,
    applies,
    validate,
)

pytestmark = pytest.mark.django_db

BASE_PATH = "reporting.service.report_validation.validators.activity_data_coverage_validator"
APPLIES_TO_SECTION_PATH = f"{BASE_PATH}.applies_to_section"


class TestActivityDataCoverageValidator:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")

        self.report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
        )

        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
        )

        self.activity = baker.make_recipe("registration.tests.utils.activity")
        self.report_operation.activities.add(self.activity)

        self.error_key = f"{SECTION}_facility_{self.facility_report.facility_id}"

    def test_applies_returns_true_when_section_is_applicable(self):
        with patch(APPLIES_TO_SECTION_PATH, return_value=True) as mock_applies:
            result = applies(self.report_version)

        assert result is True
        mock_applies.assert_called_once_with(self.report_version, SECTION)

    def test_applies_returns_false_when_section_is_not_applicable(self):
        with patch(APPLIES_TO_SECTION_PATH, return_value=False) as mock_applies:
            result = applies(self.report_version)

        assert result is False
        mock_applies.assert_called_once_with(self.report_version, SECTION)

    def test_validate_returns_no_error_when_no_activity_data_exists(self):
        errors = validate(self.report_version)

        assert errors == {}

    def test_validate_returns_no_error_when_all_activity_data_exists(self):
        baker.make_recipe(
            "reporting.tests.utils.report_activity",
            report_version=self.report_version,
            facility_report=self.facility_report,
            activity=self.activity,
        )

        errors = validate(self.report_version)

        assert errors == {}

    def test_validate_returns_error_when_partial_activity_data_exists(self):
        second_activity = baker.make_recipe("registration.tests.utils.activity")
        self.report_operation.activities.add(second_activity)

        baker.make_recipe(
            "reporting.tests.utils.report_activity",
            report_version=self.report_version,
            facility_report=self.facility_report,
            activity=self.activity,
        )

        errors = validate(self.report_version)

        assert self.error_key in errors

        error = errors[self.error_key]
        assert error.severity == Severity.ERROR
        assert error.key == ReportValidationErrorKey.ACTIVITY_DATA_COVERAGE
        assert error.message == "Missing activity data."

        assert error.context is not None
        assert error.context.report_version_id == self.report_version.id
        assert error.context.facility_id == self.facility_report.facility_id
        assert error.context.facility_name == self.facility_report.facility_name
        assert error.context.section == SECTION
        assert error.context.section_title == "Activities"

    def test_validate_returns_no_error_when_no_expected_activities(self):
        self.report_operation.activities.clear()

        errors = validate(self.report_version)

        assert errors == {}
