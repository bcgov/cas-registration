from uuid import UUID

from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission_allocation import ReportEmissionAllocation
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
    collect_missing_fields,
)
from reporting.service.reporting_flow_service import resolve_flow
from reporting.service.reporting_flow_applicability import (
    SECTION_APPLICABLE_FLOWS,
)

TAGS = [ValidationTags.REPORT_VALIDATION]

SECTION = "allocation_of_emissions"
SECTION_TITLE = "Allocation of emissions"

REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "allocation_methodology",
        "label": "Allocation methodology",
        "field_type": "scalar",
    },
]


def applies(report_version: ReportVersion) -> bool:
    flow = resolve_flow(report_version)
    return flow in SECTION_APPLICABLE_FLOWS.get(SECTION, set())


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


def _build_facility_error(
    *,
    report_version: ReportVersion,
    facility_report: FacilityReport,
    missing_field_labels: list[str],
) -> ReportValidationError:
    return _build_error(
        report_version_id=report_version.id,
        facility_id=facility_report.facility_id,
        facility_name=facility_report.facility_name,
        missing_field_labels=missing_field_labels,
    )


def _get_allocation_missing_fields(
    allocation_record: ReportEmissionAllocation,
) -> list[str]:
    missing_fields = collect_missing_fields(allocation_record, REQUIRED_FIELDS)

    if (
        allocation_record.allocation_methodology == ReportEmissionAllocation.AllocationMethodologyChoices.OTHER
        and not allocation_record.allocation_other_methodology_description
    ):
        missing_fields.append("Allocation other methodology description")

    return sorted(set(missing_fields))


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}
    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        error_key = f"error_required_fields_{SECTION}_facility_{facility_report.facility_id}"

        try:
            allocation_record = ReportEmissionAllocation.objects.get(
                report_version=report_version,
                facility_report=facility_report,
            )
        except ReportEmissionAllocation.DoesNotExist:
            errors[error_key] = _build_facility_error(
                report_version=report_version,
                facility_report=facility_report,
                missing_field_labels=[item["label"] for item in REQUIRED_FIELDS],
            )
            continue

        missing_field_labels = _get_allocation_missing_fields(allocation_record)

        if missing_field_labels:
            errors[error_key] = _build_facility_error(
                report_version=report_version,
                facility_report=facility_report,
                missing_field_labels=missing_field_labels,
            )

    return errors
