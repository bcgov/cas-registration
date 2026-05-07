from typing import ClassVar
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.base import ReportValidator
from reporting.service.reporting_flow_service import ReportingFlow
from service.report_version_service import ReportVersionService


class SupplementaryReportVersionChangeValidator(ReportValidator):
    """
    Validates that if the report is supplementary, the user has a ReportVersion record with reason_for_change
    """

    TAGS: ClassVar[list[ValidationTags]] = [ValidationTags.ON_SUBMIT, ValidationTags.REPORT_VALIDATION]

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        if ReportVersionService.is_initial_report_version(report_version.id):
            return {}

        errors: dict[str, ReportValidationError] = {}

        reason = report_version.reason_for_change

        if reason is None or reason == "":
            errors["missing_supplementary_report_version_change"] = ReportValidationError(
                Severity.ERROR,
                "A reason for the changes in this supplementary report must be added on the Review Changes page.",
                key=ReportValidationErrorKey.MISSING_SUPPLEMENTARY_REPORT_VERSION_CHANGE,
                context=ErrorContext(report_version_id=report_version.id),
            )

        return errors
