from uuid import UUID

from reporting.models.facility_report import FacilityReport
from reporting.models.report_product import ReportProduct
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.report_validation.validators.required_fields.utils import (
    build_required_fields_error,
    collect_missing_fields_many,
)
from reporting.service.reporting_flow_service import resolve_flow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)


TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "production_data"
SECTION_TITLE = "Production data"

OPTED_IN_OPERATION = "Opted-in Operation"


REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "product",
        "label": "Product",
        "field_type": "scalar",
    },
    {
        "field": "annual_production",
        "label": "Annual production",
        "field_type": "scalar",
    },
    {
        "field": "production_methodology",
        "label": "Production methodology",
        "field_type": "scalar",
    },
]


def applies(report_version: ReportVersion) -> bool:
    flow = resolve_flow(report_version)
    return flow in SECTION_APPLICABLE_FLOWS.get(SECTION, set())


def _requires_jan_mar(report_version: ReportVersion) -> bool:
    report = report_version.report
    operation = report.operation

    if report.reporting_year_id != 2025:
        return False

    if operation.registration_purpose != OPTED_IN_OPERATION:
        return False

    opted_in_operation = operation.opted_in_operation
    if opted_in_operation is None:
        return False

    return opted_in_operation.final_reporting_year_id == 2025


def _build_error(
    *,
    report_version_id: int,
    facility_id: UUID,
    facility_name: str,
    missing_field_labels: list[str],
) -> ReportValidationError:
    return build_required_fields_error(
        report_version_id=report_version_id,
        facility_id=facility_id,
        facility_name=facility_name,
        section=SECTION,
        section_title=SECTION_TITLE,
        missing_field_labels=missing_field_labels,
    )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}

    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        queryset = ReportProduct.objects.filter(
            report_version=report_version,
            facility_report=facility_report,
        )

        if not queryset.exists():
            errors[f"error_required_fields_{SECTION}_facility_{facility_report.facility_id}"] = _build_error(
                report_version_id=report_version.id,
                facility_id=facility_report.facility_id,
                facility_name=facility_report.facility_name,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
            )
            continue

        missing_field_labels = collect_missing_fields_many(
            queryset,
            REQUIRED_FIELDS,
        )

        for report_product in queryset:
            if report_version.report.reporting_year_id == 2024 and report_product.production_data_apr_dec is None:
                missing_field_labels.append("Apr-Dec production data")

            if _requires_jan_mar(report_version) and report_product.production_data_jan_mar is None:
                missing_field_labels.append("Jan-Mar production data")

            if (
                report_product.production_methodology == ReportProduct.ProductionMethodologyChoices.OTHER
                and not report_product.production_methodology_description
            ):
                missing_field_labels.append("Production methodology description")

        missing_field_labels = sorted(set(missing_field_labels))

        if missing_field_labels:
            errors[f"error_required_fields_{SECTION}_facility_{facility_report.facility_id}"] = _build_error(
                report_version_id=report_version.id,
                facility_id=facility_report.facility_id,
                facility_name=facility_report.facility_name,
                missing_field_labels=missing_field_labels,
            )

    return errors
