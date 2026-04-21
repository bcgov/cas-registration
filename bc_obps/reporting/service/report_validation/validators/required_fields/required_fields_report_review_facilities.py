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
from reporting.service.reporting_flow_service import resolve_flow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)

TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "review_facilities"
SECTION_TITLE = "Review facilities"


def applies(report_version: ReportVersion) -> bool:
    flow = resolve_flow(report_version)
    return flow in SECTION_APPLICABLE_FLOWS.get(SECTION, set())


def _build_error(*, report_version_id: int) -> ReportValidationError:
    return ReportValidationError(
        severity=Severity.ERROR,
        message="No facilities selected.",
        key=ReportValidationErrorKey.ERROR_REQUIRED_FIELDS,
        context=ErrorContext(
            report_version_id=report_version_id,
            missing_fields=["Facilities"],
            section=SECTION,
            section_title=SECTION_TITLE,
        ),
    )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    has_selected_facilities = FacilityReport.objects.filter(report_version=report_version).exists()

    if has_selected_facilities:
        return {}

    return {
        f"error_required_fields_{SECTION}": _build_error(
            report_version_id=report_version.id,
        )
    }
