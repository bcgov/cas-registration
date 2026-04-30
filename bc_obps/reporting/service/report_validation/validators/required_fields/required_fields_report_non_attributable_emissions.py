from uuid import UUID
from django.db.models import Prefetch
from reporting.models.facility_report import FacilityReport
from reporting.models.report_non_attributable_emissions import (
    ReportNonAttributableEmissions,
)
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.types import RequiredFieldConfig
from reporting.service.report_validation.validators.required_fields.utils import collect_missing_fields_many


from reporting.service.report_validation.validators.required_fields.utils import applies_to_section
from reporting.service.reporting_flow_service import ReportingFlow


TAGS = [ValidationTags.REPORT_VALIDATION]
SECTION = "non_attributable_emissions"
SECTION_TITLE = "Non-attributable emissions"
REQUIRED_FIELDS: list[RequiredFieldConfig] = [
    {
        "field": "activity",
        "label": "Activity name",
        "field_type": "scalar",
    },
    {
        "field": "source_type",
        "label": "Source type",
        "field_type": "scalar",
    },
    {
        "field": "emission_category",
        "label": "Emission category",
        "field_type": "scalar",
    },
    {
        "field": "gas_type",
        "label": "Gas type",
        "field_type": "m2m",
    },
]


def applies(flow: ReportingFlow) -> bool:
    return applies_to_section(flow, SECTION)


def _build_error(
    *,
    report_version_id: int,
    facility_id: UUID,
    facility_name: str,
    missing_field_labels: list[str],
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
            section=SECTION,
            section_title=SECTION_TITLE,
        ),
    )


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}

    # use Prefetch for_related records
    facility_reports = FacilityReport.objects.filter(
        report_version=report_version,
    ).prefetch_related(
        Prefetch(
            "reportnonattributableemissions_records",
            queryset=ReportNonAttributableEmissions.objects.filter(
                report_version=report_version,
            ),
            to_attr="non_attributable_emission_records",
        )
    )

    for facility_report in facility_reports:
        records = facility_report.non_attributable_emission_records

        # only validate required fields when a record exists
        if not records:
            continue

        missing_field_labels = collect_missing_fields_many(
            records,
            REQUIRED_FIELDS,
        )

        if missing_field_labels:
            error_key = f"error_required_fields_{SECTION}_facility_{facility_report.facility_id}"

            errors[error_key] = _build_error(
                report_version_id=report_version.id,
                facility_id=facility_report.facility_id,
                facility_name=facility_report.facility_name,
                missing_field_labels=sorted(set(missing_field_labels)),
            )

    return errors
