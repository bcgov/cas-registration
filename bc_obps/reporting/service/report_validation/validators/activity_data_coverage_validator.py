from reporting.models.report_version import ReportVersion
from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.utils import (
    applies_to_section,
)

TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "activity_data_coverage"
SECTION_TITLE = "Activities"


def applies(report_version: ReportVersion) -> bool:
    return applies_to_section(report_version, SECTION)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}

    expected_activity_ids = set(report_version.report_operation.activities.values_list("id", flat=True))

    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        reported_activity_ids = set(
            ReportActivity.objects.filter(
                report_version=report_version,
                facility_report=facility_report,
            ).values_list("activity_id", flat=True)
        )

        # If no activity data exists, let the required fields validator catch it.
        if not reported_activity_ids:
            continue

        missing_activity_ids = expected_activity_ids - reported_activity_ids

        if missing_activity_ids:
            error_key = f"{SECTION}_facility_{facility_report.facility_id}"

            errors[error_key] = ReportValidationError(
                severity=Severity.ERROR,
                key=ReportValidationErrorKey.ACTIVITY_DATA_COVERAGE,
                message="Missing activity data.",
                context=ErrorContext(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    section=SECTION,
                    section_title=SECTION_TITLE,
                ),
            )

    return errors
