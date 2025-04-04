from django.db.models import QuerySet
from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    facility_reports: QuerySet[FacilityReport] = report_version.facility_reports.all()

    errors = {}

    for facility_report in facility_reports:
        if facility_report.facility_bcghgid is None:
            errors[f"facility_bcghgid_{facility_report.facility_id}"] = ReportValidationError(
                Severity.ERROR,
                f"Report is missing a BCGHGID for the facility {facility_report.facility_name}, please make sure one has been assigned.",
            )

    return errors
