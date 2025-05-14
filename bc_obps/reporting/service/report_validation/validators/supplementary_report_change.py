from django.core.exceptions import ObjectDoesNotExist
from service.report_version_service import ReportVersionService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)

from reporting.models.report_version import ReportVersion

def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates that if the report is supplementary, the user has a ReportVersion record with review_change
    """
    # Check if the report version is supplementary
    is_initial_version = ReportVersionService.is_initial_report_version(report_version.id)
    if is_initial_version:
        return {}

    errors = {}
    # Check for the ReportVersion has value in field review_change
    try:
        report_change: ReportVersion = report_version.review_change

    except ObjectDoesNotExist:
        errors["missing_supplementary_report_change"] = ReportValidationError(
            Severity.ERROR,
            "No change review value found for this supplementary report version.",
        )

    return errors
