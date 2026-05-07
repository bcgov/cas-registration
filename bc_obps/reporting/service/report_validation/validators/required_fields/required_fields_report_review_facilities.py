from typing import ClassVar
from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.reporting_flow_service import ReportingFlow


class RequiredFieldsReviewFacilitiesValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "review_facilities"
    SECTION_TITLE: ClassVar[str] = "Review facilities"

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        has_selected_facilities = FacilityReport.objects.filter(
            report_version=report_version,
        ).exists()

        if has_selected_facilities:
            return {}

        return {
            f"error_required_fields_{cls.SECTION}": cls.build_error(
                report_version_id=report_version.id,
                missing_field_labels=["Facilities"],
            )
        }
