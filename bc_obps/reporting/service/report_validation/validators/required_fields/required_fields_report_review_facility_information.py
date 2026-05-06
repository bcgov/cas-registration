from typing import ClassVar

from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.report_validation_tags import (
    ValidationTags,
)
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)
from reporting.service.report_validation.validators.required_fields.utils import (
    collect_missing_fields_many,
)
from reporting.service.reporting_flow_service import ReportingFlow, resolve_flow

TAGS = [ValidationTags.REPORT_VALIDATION]

REVIEW_FACILITIES_SECTION = "review_facility_report_information"
REVIEW_FACILITIES_SECTION_TITLE = "Report Information"

LFO_COMPLETION_REQUIRED_FLOWS = {
    ReportingFlow.LFO,
    ReportingFlow.NEW_ENTRANT_LFO,
    ReportingFlow.REPORTING_ONLY_LFO,
}


class RequiredFieldsReviewFacilityInformationValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "review_facility_information"
    SECTION_TITLE: ClassVar[str] = "Review facility"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {
            "field": "facility_name",
            "label": "Facility name",
            "field_type": "scalar",
        },
        {
            "field": "facility_type",
            "label": "Facility type",
            "field_type": "scalar",
        },
        {
            "field": "activities",
            "label": "Activities",
            "field_type": "m2m",
        },
    ]

    @classmethod
    def build_section_error(
        cls,
        *,
        report_version_id: int,
        missing_field_labels: list[str],
        section: str,
        section_title: str,
    ) -> ReportValidationError:
        original_section = cls.SECTION
        original_section_title = cls.SECTION_TITLE

        cls.SECTION = section
        cls.SECTION_TITLE = section_title

        try:
            return cls.build_error(
                report_version_id=report_version_id,
                missing_field_labels=missing_field_labels,
            )
        finally:
            cls.SECTION = original_section
            cls.SECTION_TITLE = original_section_title

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        errors: dict[str, ReportValidationError] = {}

        facility_reports = list(FacilityReport.objects.filter(report_version=report_version))

        if not facility_reports:
            return {
                f"error_required_fields_{cls.SECTION}": cls.build_error(
                    report_version_id=report_version.id,
                    missing_field_labels=[item["label"] for item in cls.REQUIRED_FIELDS],
                )
            }

        missing_field_labels = collect_missing_fields_many(
            facility_reports,
            cls.REQUIRED_FIELDS,
        )

        if missing_field_labels:
            errors[f"error_required_fields_{cls.SECTION}"] = cls.build_error(
                report_version_id=report_version.id,
                missing_field_labels=sorted(set(missing_field_labels)),
            )

        resolved_flow = flow or resolve_flow(report_version)

        if resolved_flow in LFO_COMPLETION_REQUIRED_FLOWS:
            has_incomplete_facility = any(not facility_report.is_completed for facility_report in facility_reports)

            if has_incomplete_facility:
                errors[f"error_required_fields_{REVIEW_FACILITIES_SECTION}"] = cls.build_section_error(
                    report_version_id=report_version.id,
                    missing_field_labels=["All facilities must be marked complete"],
                    section=REVIEW_FACILITIES_SECTION,
                    section_title=REVIEW_FACILITIES_SECTION_TITLE,
                )

        return errors


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsReviewFacilityInformationValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    return RequiredFieldsReviewFacilityInformationValidator.validate(report_version)
