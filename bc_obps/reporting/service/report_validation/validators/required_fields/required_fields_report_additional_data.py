from reporting.models.report_additional_data import ReportAdditionalData
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

SECTION = "additional_reporting_data"
SECTION_TITLE = "Additional reporting data"
REQUIRED_FIELDS: list[RequiredFieldConfig] = []


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


def _get_missing_additional_reporting_fields(
    report_additional_data: ReportAdditionalData,
) -> list[str]:
    missing_fields: list[str] = []

    if report_additional_data.capture_emissions:
        if report_additional_data.emissions_on_site_use is None:
            missing_fields.append("Emissions (t) captured for on-site use")
        if report_additional_data.emissions_on_site_sequestration is None:
            missing_fields.append("Emissions (t) captured for on-site sequestration")
        if report_additional_data.emissions_off_site_transfer is None:
            missing_fields.append("Emissions (t) captured for off-site transfer")

    return missing_fields


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    try:
        report_additional_data: ReportAdditionalData = report_version.report_additional_data
    except ReportAdditionalData.DoesNotExist:
        return {
            f"error_required_fields_{SECTION}": _build_error(
                report_version_id=report_version.id,
                missing_field_labels=[SECTION_TITLE],
            )
        }

    missing_field_labels = collect_missing_fields(
        report_additional_data,
        REQUIRED_FIELDS,
    )
    missing_field_labels.extend(_get_missing_additional_reporting_fields(report_additional_data))

    if not missing_field_labels:
        return {}

    return {
        f"error_required_fields_{SECTION}": _build_error(
            report_version_id=report_version.id,
            missing_field_labels=missing_field_labels,
        )
    }
