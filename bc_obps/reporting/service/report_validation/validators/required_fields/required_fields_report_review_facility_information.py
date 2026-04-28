from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import (
    ValidationTags,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.report_validation.validators.required_fields.utils import (
    collect_missing_fields_many,
    applies_to_section,
)
from reporting.service.reporting_flow_service import resolve_flow, ReportingFlow

TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "review_facility_information"
SECTION_TITLE = "Review facility"

REVIEW_FACILITIES_SECTION = "review_facility_report_information"
REVIEW_FACILITIES_SECTION_TITLE = "Report Information"

REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "facility_name",
        "label": "Facility name",
        "field_type": "scalar",
    },
    {
        "field": "facility_type",
        "label": "Facility type",
        "field_type": "scalar",
    },
    {
        "field": "activities",
        "label": "Activities",
        "field_type": "m2m",
    },
]

LFO_COMPLETION_REQUIRED_FLOWS = {
    ReportingFlow.LFO,
    ReportingFlow.NEW_ENTRANT_LFO,
    ReportingFlow.REPORTING_ONLY_LFO,
}


def applies(report_version: ReportVersion) -> bool:
    return applies_to_section(report_version, SECTION)


def _build_error(
    *,
    report_version_id: int,
    missing_field_labels: list[str],
    section: str = SECTION,
    section_title: str = SECTION_TITLE,
) -> ReportValidationError:
    return ReportValidationError(
        severity=Severity.ERROR,
        message="Required fields are empty.",
        key=ReportValidationErrorKey.ERROR_REQUIRED_FIELDS,
        context=ErrorContext(
            report_version_id=report_version_id,
            missing_fields=missing_field_labels,
            section=section,
            section_title=section_title,
        ),
    )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}
    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    if not facility_reports.exists():
        errors[f"error_required_fields_{SECTION}"] = _build_error(
            report_version_id=report_version.id,
            missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
        )
        return errors

    missing_field_labels = collect_missing_fields_many(
        facility_reports,
        REQUIRED_FIELDS,
    )

    if missing_field_labels:
        errors[f"error_required_fields_{SECTION}"] = _build_error(
            report_version_id=report_version.id,
            missing_field_labels=sorted(set(missing_field_labels)),
        )

    flow = resolve_flow(report_version)
    if flow in LFO_COMPLETION_REQUIRED_FLOWS:
        if facility_reports.filter(is_completed=False).exists():
            errors[f"error_required_fields_{REVIEW_FACILITIES_SECTION}"] = _build_error(
                report_version_id=report_version.id,
                missing_field_labels=["All facilities must be marked complete"],
                section=REVIEW_FACILITIES_SECTION,
                section_title=REVIEW_FACILITIES_SECTION_TITLE,
            )

    return errors
