from django.core.exceptions import ObjectDoesNotExist
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_verification import ReportVerification
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_verification_service import ReportVerificationService


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates that the report meets necessary verification statement requirements before submission:
        - If report verification is required, ensures that a `ReportVerification` entry exists.
        - If a verification statement is required, ensures the presence of a corresponding attachment.
    """
    # Check if verification is mandatory
    isVerificationMandatory = ReportVerificationService.get_report_verification_status(report_version.id).get(
        "verification_required"
    )

    errors = {}

    if isVerificationMandatory:
        # Check for the ReportVerification entry
        try:
            ReportVerification.objects.get(report_version_id=report_version.id)  # attempt to get the object.
        except ObjectDoesNotExist:
            errors["missing_report_verification"] = ReportValidationError(
                Severity.ERROR, "Report verification form not found in the report."
            )

        # Check for the attachment only if mandatory
        try:
            ReportAttachment.objects.get(
                report_version_id=report_version.id,
                attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
            )
        except ReportAttachment.DoesNotExist:
            errors["verification_statement"] = ReportValidationError(
                Severity.ERROR,
                "Mandatory verification statement document was not uploaded with this report.",
            )

    return errors
