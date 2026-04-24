from typing import Any, Iterable, Callable
from uuid import UUID

from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)

from reporting.service.reporting_flow_service import resolve_flow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)


def applies_to_section(report_version: ReportVersion, section: str) -> bool:
    flow = resolve_flow(report_version)
    return flow in SECTION_APPLICABLE_FLOWS.get(section, set())


def is_blank_scalar(value: object) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return not value.strip()
    return False


def is_missing_field(obj: Any, field_name: str, field_type: str) -> bool:
    value = getattr(obj, field_name, None)

    if field_type == "scalar":
        return value is None or is_blank_scalar(value)

    if field_type == "m2m":
        return value is None or not value.exists()

    return False


def collect_missing_fields(
    obj: Any,
    required_fields: list[RequiredFieldConfig],
) -> list[str]:
    missing: list[str] = []

    for item in required_fields:
        if is_missing_field(obj, item["field"], item["field_type"]):
            missing.append(item["label"])

    return missing


def collect_missing_fields_many(
    queryset: Iterable[Any],
    required_fields: list[RequiredFieldConfig],
) -> list[str]:
    missing: set[str] = set()

    for obj in queryset:
        for item in required_fields:
            if is_missing_field(obj, item["field"], item["field_type"]):
                missing.add(item["label"])

    return sorted(missing)


def build_required_fields_error(
    *,
    report_version_id: int,
    section: str,
    section_title: str,
    missing_field_labels: list[str],
    facility_id: UUID | None = None,
    facility_name: str | None = None,
) -> ReportValidationError:
    return ReportValidationError(
        severity=Severity.ERROR,
        message="Required fields are empty.",
        key=ReportValidationErrorKey.ERROR_REQUIRED_FIELDS,
        context=ErrorContext(
            report_version_id=report_version_id,
            facility_id=facility_id,
            facility_name=facility_name,
            missing_fields=missing_field_labels,
            section=section,
            section_title=section_title,
        ),
    )


def validate_required_fields_per_facility(
    *,
    report_version: ReportVersion,
    section: str,
    section_title: str,
    required_fields: list[RequiredFieldConfig],
    queryset_getter: Callable[[ReportVersion, FacilityReport], Any],
) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}

    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        queryset = queryset_getter(report_version, facility_report)

        if not queryset.exists():
            errors[f"error_required_fields_{section}_facility_{facility_report.facility_id}"] = (
                build_required_fields_error(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    section=section,
                    section_title=section_title,
                    missing_field_labels=[item["label"] for item in required_fields],
                )
            )
            continue

        missing_field_labels = collect_missing_fields_many(
            queryset,
            required_fields,
        )

        if missing_field_labels:
            errors[f"error_required_fields_{section}_facility_{facility_report.facility_id}"] = (
                build_required_fields_error(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    section=section,
                    section_title=section_title,
                    missing_field_labels=missing_field_labels,
                )
            )

    return errors
