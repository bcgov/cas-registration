from reporting.models.report_person_responsible import ReportPersonResponsible
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.types import RequiredFieldConfig
from reporting.service.report_validation.utils import is_blank_scalar
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "first_name",
        "label": "First name",
        "field_type": "scalar",
    },
    {
        "field": "last_name",
        "label": "Last name",
        "field_type": "scalar",
    },
    {
        "field": "email",
        "label": "Business email address",
        "field_type": "scalar",
    },
    {
        "field": "phone_number",
        "label": "Business telephone number",
        "field_type": "scalar",
    },
    {
        "field": "street_address",
        "label": "Business mailing address",
        "field_type": "scalar",
    },
    {
        "field": "municipality",
        "label": "Municipality",
        "field_type": "scalar",
    },
    {
        "field": "province",
        "label": "Province",
        "field_type": "scalar",
    },
    {
        "field": "postal_code",
        "label": "Postal code",
        "field_type": "scalar",
    },
    {
        "field": "business_role",
        "label": "Job title / position",
        "field_type": "scalar",
    },
]


SECTION = "person_responsible"
SECTION_TITLE = "Person responsible"


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
        report_person_responsible: ReportPersonResponsible = report_version.report_person_responsible
    except ReportPersonResponsible.DoesNotExist:
        return {
            f"error_required_fields_{SECTION}": _build_error(
                report_version_id=report_version.id,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
            )
        }

    missing_field_labels: list[str] = []

    for item in REQUIRED_FIELDS:
        field_name = item["field"]
        field_label = item["label"]
        field_type = item["field_type"]

        is_missing = False

        if field_type == "scalar":
            value = getattr(report_person_responsible, field_name, None)
            is_missing = is_blank_scalar(value)

        if is_missing:
            missing_field_labels.append(field_label)

    if not missing_field_labels:
        return {}

    return {
        f"error_required_fields_{SECTION}": _build_error(
            report_version_id=report_version.id,
            missing_field_labels=missing_field_labels,
        )
    }
