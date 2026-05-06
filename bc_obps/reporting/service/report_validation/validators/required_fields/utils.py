from typing import Any, Iterable

from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)

from reporting.service.reporting_flow_service import ReportingFlow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)


def applies_to_section(flow: ReportingFlow, section: str) -> bool:
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
