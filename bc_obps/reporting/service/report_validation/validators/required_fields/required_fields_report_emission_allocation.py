from typing import ClassVar

from django.db.models import Count, Prefetch

from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.report_validation.validators.required_fields.utils import (
    collect_missing_fields,
)
from reporting.service.reporting_flow_service import ReportingFlow

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


class RequiredFieldsAllocationOfEmissionsValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "allocation_of_emissions"
    SECTION_TITLE: ClassVar[str] = "Allocation of emissions"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {
            "field": "allocation_methodology",
            "label": "Allocation methodology",
            "field_type": "scalar",
        },
    ]

    @classmethod
    def get_allocation_missing_fields(
        cls,
        allocation_record: ReportEmissionAllocation,
    ) -> list[str]:
        missing_fields = collect_missing_fields(allocation_record, cls.REQUIRED_FIELDS)

        if (
            allocation_record.allocation_methodology == ReportEmissionAllocation.AllocationMethodologyChoices.OTHER
            and not allocation_record.allocation_other_methodology_description
        ):
            missing_fields.append("Allocation other methodology description")

        return sorted(set(missing_fields))

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        errors: dict[str, ReportValidationError] = {}

        facility_reports = (
            FacilityReport.objects.filter(report_version=report_version)
            .annotate(allocation_count=Count("reportemissionallocation_records"))
            .prefetch_related(
                Prefetch(
                    "reportemissionallocation_records",
                    queryset=ReportEmissionAllocation.objects.filter(
                        report_version=report_version,
                    ),
                    to_attr="emission_allocation_records",
                )
            )
        )

        for facility_report in facility_reports:
            error_key = f"error_required_fields_{cls.SECTION}_facility_{facility_report.facility_id}"

            if facility_report.allocation_count == 0:
                errors[error_key] = cls.build_error(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    missing_field_labels=[item["label"] for item in cls.REQUIRED_FIELDS],
                )
                continue

            allocation_record = facility_report.emission_allocation_records[0]
            missing_field_labels = cls.get_allocation_missing_fields(allocation_record)

            if missing_field_labels:
                errors[error_key] = cls.build_error(
                    report_version_id=report_version.id,
                    facility_id=facility_report.facility_id,
                    facility_name=facility_report.facility_name,
                    missing_field_labels=missing_field_labels,
                )

        return errors


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsAllocationOfEmissionsValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    return RequiredFieldsAllocationOfEmissionsValidator.validate(report_version)
