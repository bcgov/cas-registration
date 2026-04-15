from reporting.models.report_operation import ReportOperation
from reporting.models.report_operation_representative import ReportOperationRepresentative
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.types import RequiredFieldConfig


REQUIRED_REPORT_OPERATION_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "operation_representative_name",
        "label": "Operation representative name",
        "field_type": "custom",
    },
    {
        "field": "operation_name",
        "label": "Operation name",
        "field_type": "scalar",
    },
    {
        "field": "operator_legal_name",
        "label": "Operator legal name",
        "field_type": "scalar",
    },
    {
        "field": "activities",
        "label": "Activities",
        "field_type": "m2m",
    },
    {
        "field": "regulated_products",
        "label": "Regulated products",
        "field_type": "m2m",
    },
]


def _build_error(
    *,
    report_version_id: int,
    missing_field_labels: list[str],
) -> ReportValidationError:
    return ReportValidationError(
        severity=Severity.ERROR,
        message="Required fields are empty on review operation information.",
        key=ReportValidationErrorKey.ERROR_REPORT_OPERATION_INFORMATION,
        context=ErrorContext(
            report_version_id=report_version_id,
            missing_fields=missing_field_labels,
        ),
    )


def _is_blank_scalar(value: object) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return not value.strip()
    return False


def _is_missing_operation_representative(report_version_id: int) -> bool:
    return not ReportOperationRepresentative.objects.filter(
        report_version__id=report_version_id,
        selected_for_report=True,
    ).exists()


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    report_operation: ReportOperation = report_version.report_operation
    missing_field_labels: list[str] = []

    for item in REQUIRED_REPORT_OPERATION_FIELDS:
        field_name = item["field"]
        field_label = item["label"]
        field_type = item["field_type"]

        is_missing = False

        if field_type == "scalar":
            value = getattr(report_operation, field_name, None)
            is_missing = _is_blank_scalar(value)

        elif field_type == "m2m":
            relation = getattr(report_operation, field_name, None)
            is_missing = relation is None or not relation.exists()

        elif field_type == "custom":
            if field_name == "operation_representative_name":
                is_missing = _is_missing_operation_representative(report_version.id)

        if is_missing:
            missing_field_labels.append(field_label)

    if not missing_field_labels:
        return {}

    return {
        "error_report_operation_information": _build_error(
            report_version_id=report_version.id,
            missing_field_labels=missing_field_labels,
        )
    }
