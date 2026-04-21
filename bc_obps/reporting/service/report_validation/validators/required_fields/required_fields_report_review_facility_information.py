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
)
from reporting.service.reporting_flow_service import resolve_flow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)


TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "review_facility_information"
SECTION_TITLE = "Review facility"


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


def applies(report_version: ReportVersion) -> bool:
    flow = resolve_flow(report_version)
    return flow in SECTION_APPLICABLE_FLOWS.get(SECTION, set())


def _build_error(
    *,
    report_version_id: int,
    missing_field_labels: list[str],
) -> ReportValidationError:
    return ReportValidationError(
        severity=Severity.ERROR,
        message="Required fields are empty.",
        key=ReportValidationErrorKey.ERROR_REQUIRED_FIELDS,
        context=ErrorContext(
            report_version_id=report_version_id,
            missing_fields=missing_field_labels,
            section=SECTION,
            section_title=SECTION_TITLE,
        ),
    )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    if not facility_reports.exists():
        return {
            f"error_required_fields_{SECTION}": _build_error(
                report_version_id=report_version.id,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
            )
        }

    missing_field_labels = collect_missing_fields_many(
        facility_reports,
        REQUIRED_FIELDS,
    )

    if not missing_field_labels:
        return {}

    return {
        f"error_required_fields_{SECTION}": _build_error(
            report_version_id=report_version.id,
            missing_field_labels=missing_field_labels,
        )
    }
