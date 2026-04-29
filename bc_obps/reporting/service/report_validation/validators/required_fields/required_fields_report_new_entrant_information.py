from reporting.models.report_new_entrant import ReportNewEntrant
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
    collect_missing_fields,
)

from reporting.service.report_validation.validators.required_fields.utils import applies_to_section
from reporting.service.reporting_flow_service import ReportingFlow

TAGS = [ValidationTags.REPORT_VALIDATION]
SECTION = "new_entrant_information"
SECTION_TITLE = "New entrant information"
REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "authorization_date",
        "label": "Authorization date",
        "field_type": "scalar",
    },
    {
        "field": "first_shipment_date",
        "label": "Date of first shipment",
        "field_type": "scalar",
    },
    {
        "field": "new_entrant_period_start",
        "label": "Date new entrant period began",
        "field_type": "scalar",
    },
]


def applies(flow: ReportingFlow) -> bool:
    return applies_to_section(flow, SECTION)


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
    try:
        report_new_entrant: ReportNewEntrant = report_version.report_new_entrant.get()
    except ReportNewEntrant.DoesNotExist:
        return {
            f"error_required_fields_{SECTION}": _build_error(
                report_version_id=report_version.id,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
            )
        }

    missing_field_labels = collect_missing_fields(
        report_new_entrant,
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
