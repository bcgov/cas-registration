from model_bakery.baker import make_recipe
import pytest
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators import facility_bcghgid_presence


@pytest.mark.django_db
class TestFacilityBcghgidValidator:
    def test_error_for_each_facility_if_missing_bcghgid(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        facility_report1 = make_recipe(
            "reporting.tests.utils.facility_report",
            facility_name="a",
            report_version=report_version,
        )
        facility_report2 = make_recipe(
            "reporting.tests.utils.facility_report",
            facility_name="b",
            report_version=report_version,
        )
        make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=report_version,
            facility_bcghgid="bcghgid",
        )

        result = facility_bcghgid_presence.validate(report_version)
        assert result[f"facility_bcghgid_{facility_report1.facility_id}"] == ReportValidationError(
            Severity.ERROR,
            "Report is missing a BCGHGID for the facility a, please make sure one has been assigned.",
        )
        assert result[f"facility_bcghgid_{facility_report2.facility_id}"] == ReportValidationError(
            Severity.ERROR,
            "Report is missing a BCGHGID for the facility b, please make sure one has been assigned.",
        )
        assert len(result) == 2

    def test_succeeds_if_all_facility_reports_have_bcghgid(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=report_version,
            facility_bcghgid="bcghgid",
            _quantity=5,
        )

        result = facility_bcghgid_presence.validate(report_version)
        assert report_version.facility_reports.count() == 5
        assert not result

    def test_succeeds_if_no_facility_reports(self):
        report_version = make_recipe("reporting.tests.utils.report_version")

        result = facility_bcghgid_presence.validate(report_version)
        assert not result
