from uuid import UUID

from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.utils import (
    build_required_fields_error,
)
from reporting.service.report_validation.validators.required_fields.utils import applies_to_section


TAGS = [ValidationTags.REPORT_VALIDATION]
SECTION = "activity_data"
SECTION_TITLE = "Activity data"


def applies(report_version: ReportVersion) -> bool:
    return applies_to_section(report_version, SECTION)


def _build_error(
    *,
    report_version_id: int,
    facility_id: UUID,
    facility_name: str,
    missing_field_labels: list[str],
) -> ReportValidationError:
    return build_required_fields_error(
        report_version_id=report_version_id,
        facility_id=facility_id,
        facility_name=facility_name,
        section=SECTION,
        section_title=SECTION_TITLE,
        missing_field_labels=missing_field_labels,
    )


def _build_facility_error(
    *,
    report_version: ReportVersion,
    facility_report: FacilityReport,
    missing_field_labels: list[str],
) -> ReportValidationError:
    return _build_error(
        report_version_id=report_version.id,
        facility_id=facility_report.facility_id,
        facility_name=facility_report.facility_name,
        missing_field_labels=missing_field_labels,
    )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}

    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        queryset = ReportActivity.objects.filter(
            report_version=report_version,
            facility_report=facility_report,
        )

        error_key = f"error_required_fields_{SECTION}_facility_{facility_report.facility_id}"

        if not queryset.exists():
            errors[error_key] = _build_facility_error(
                report_version=report_version,
                facility_report=facility_report,
                missing_field_labels=["Activity data"],
            )
            continue

    return errors
