from service.report_version_service import ReportVersionService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.ON_SUBMIT]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates that if the report is supplementary, the user has a ReportVersion record with reason_for_change
    """
    # Check if the report version is supplementary
    is_initial_version = ReportVersionService.is_initial_report_version(report_version.id)
    if is_initial_version:
        return {}

    errors = {}

    # Check for the ReportVersion has value in field reason_for_change

    val = report_version.reason_for_change

    if val is None or val == "":
        errors["missing_supplementary_report_version_change"] = ReportValidationError(
            Severity.ERROR,
            "A reason for the changes in this supplementary report must be added on the Review Changes page.",
            key=ReportValidationErrorKey.MISSING_SUPPLEMENTARY_REPORT_VERSION_CHANGE,
            context=ErrorContext(report_version_id=report_version.id),
        )
    else:
        pass

    return errors
