from django.core.exceptions import ObjectDoesNotExist
from service.report_version_service import ReportVersionService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates that if the report is supplementary, the user has confirmed the necessary attachment requirements:
        - Confirms that required supplementary attachments have been uploaded.
        - Confirms that existing attachments are still relevant.
    """
    # Check if the report version is supplementary
    is_initial_version = ReportVersionService.is_initial_report_version(report_version.id)
    if is_initial_version:
        return {}

    errors = {}
    # Check for the ReportAttachmentConfirmation entry
    try:
        attachment_confirmation = ReportAttachmentConfirmation.objects.get(report_version_id=report_version.id)

        # Validate confirmation for required attachments
        if not attachment_confirmation.confirm_supplementary_required_attachments_uploaded:
            errors["missing_required_attachment_confirmation"] = ReportValidationError(
                Severity.ERROR,
                "Must confirm that all required supplementary attachments have been uploaded.",
            )
        if not attachment_confirmation.confirm_supplementary_existing_attachments_relevant:
            errors["missing_existing_attachment_confirmation"] = ReportValidationError(
                Severity.ERROR,
                "Must confirm that all existing attachments are still relevant to the supplementary submission.",
            )
    except ObjectDoesNotExist:
        errors["missing_supplementary_report_attachment_confirmation"] = ReportValidationError(
            Severity.ERROR,
            "No attachment confirmation found for this supplementary report version.",
        )

    return errors
