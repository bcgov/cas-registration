from reporting.models.report_operation import ReportOperation
from reporting.models.report_operation_representative import (
    ReportOperationRepresentative,
)
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
from reporting.service.reporting_flow_service import resolve_flow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)


TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]

SECTION = "review_operation_information"
SECTION_TITLE = "Review operation information"


REQUIRED_FIELDS: list[RequiredFieldConfig] = [
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


def applies(report_version: ReportVersion) -> bool:
    flow = resolve_flow(report_version)
    return flow in SECTION_APPLICABLE_FLOWS[SECTION]


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


def _is_missing_operation_representative(report_version_id: int) -> bool:
    return not ReportOperationRepresentative.objects.filter(
        report_version__id=report_version_id,
        selected_for_report=True,
    ).exists()


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    try:
        report_operation: ReportOperation = report_version.report_operation
    except ReportOperation.DoesNotExist:
        return {
            f"error_required_fields_{SECTION}": _build_error(
                report_version_id=report_version.id,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS] + ["Operation representative name"],
            )
        }

    missing_field_labels = collect_missing_fields(
        report_operation,
        REQUIRED_FIELDS,
    )

    if _is_missing_operation_representative(report_version.id):
        missing_field_labels.append("Operation representative name")

    if not missing_field_labels:
        return {}

    return {
        f"error_required_fields_{SECTION}": _build_error(
            report_version_id=report_version.id,
            missing_field_labels=missing_field_labels,
        )
    }
