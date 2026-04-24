from reporting.models.report_electricity_import_data import ReportElectricityImportData
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
from reporting.service.report_validation.validators.required_fields.utils import (
    RequiredFieldConfig,
    collect_missing_fields,
)
from reporting.service.reporting_flow_service import ReportingFlow, resolve_flow

TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "electricity_import_data"
SECTION_TITLE = "Electricity Import Data"

REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "import_specified_electricity",
        "label": "Amount of imported electricity - specified sources",
        "field_type": "scalar",
    },
    {
        "field": "import_specified_emissions",
        "label": "Emissions from specified imports",
        "field_type": "scalar",
    },
    {
        "field": "import_unspecified_electricity",
        "label": "Amount of imported electricity - unspecified sources",
        "field_type": "scalar",
    },
    {
        "field": "import_unspecified_emissions",
        "label": "Emissions from unspecified imports",
        "field_type": "scalar",
    },
    {
        "field": "export_specified_electricity",
        "label": "Amount of exported electricity - specified sources",
        "field_type": "scalar",
    },
    {
        "field": "export_specified_emissions",
        "label": "Emissions from specified exports",
        "field_type": "scalar",
    },
    {
        "field": "export_unspecified_electricity",
        "label": "Amount of exported electricity - unspecified sources",
        "field_type": "scalar",
    },
    {
        "field": "export_unspecified_emissions",
        "label": "Emissions from unspecified exports",
        "field_type": "scalar",
    },
    {
        "field": "canadian_entitlement_electricity",
        "label": "Amount of electricity categorized as Canadian Entitlement Power",
        "field_type": "scalar",
    },
    {
        "field": "canadian_entitlement_emissions",
        "label": "Emissions from Canadian Entitlement Power",
        "field_type": "scalar",
    },
]


def applies(report_version: ReportVersion) -> bool:
    return resolve_flow(report_version) == ReportingFlow.EIO


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
        electricity_import_data: ReportElectricityImportData = report_version.report_electricity_import_data.get()
    except ReportElectricityImportData.DoesNotExist:
        return {
            f"error_required_fields_{SECTION}": _build_error(
                report_version_id=report_version.id,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
            )
        }

    missing_field_labels = collect_missing_fields(
        electricity_import_data,
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
