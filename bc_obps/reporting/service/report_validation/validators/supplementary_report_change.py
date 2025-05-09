from django.core.exceptions import ObjectDoesNotExist
from service.report_version_service import ReportVersionService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.models.report_change import ReportChange


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates that if the report is supplementary, the user has a ReportChange record
    """
    # Check if the report version is supplementary
    is_initial_version = ReportVersionService.is_initial_report_version(report_version.id)
    if is_initial_version:
        return {}

    errors = {}
    # Check for the ReportChange entry
    try:
        ReportChange.objects.get(report_version_id=report_version.id)

    except ObjectDoesNotExist:
        errors["missing_supplementary_report_change"] = ReportValidationError(
            Severity.ERROR,
            "No report change review found for this supplementary report version.",
        )

    return errors
