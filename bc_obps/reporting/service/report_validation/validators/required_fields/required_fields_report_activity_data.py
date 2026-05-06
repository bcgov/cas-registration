from typing import ClassVar

from django.db.models import Count

from reporting.models.facility_report import FacilityReport
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
from reporting.service.reporting_flow_service import ReportingFlow


TAGS = [ValidationTags.REPORT_VALIDATION]


ACTIVITY_DATA_LABEL = "Activity data"


class RequiredFieldsActivityDataValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "activity_data"
    SECTION_TITLE: ClassVar[str] = ACTIVITY_DATA_LABEL

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {
            "field": "activity_data",
            "label": ACTIVITY_DATA_LABEL,
            "field_type": "scalar",
        },
    ]

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        errors: dict[str, ReportValidationError] = {}

        facility_reports = (
            FacilityReport.objects.filter(report_version=report_version)
            .annotate(activity_count=Count("reportactivity_records"))
            .filter(activity_count=0)
        )

        for facility_report in facility_reports:
            error_key = f"error_required_fields_{cls.SECTION}_facility_{facility_report.facility_id}"

            errors[error_key] = cls.build_error(
                report_version_id=report_version.id,
                facility_id=facility_report.facility_id,
                facility_name=facility_report.facility_name,
                missing_field_labels=["Activity data"],
            )

        return errors


def applies(flow: ReportingFlow) -> bool:
    return RequiredFieldsActivityDataValidator.applies(flow)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    return RequiredFieldsActivityDataValidator.validate(report_version)
