from django.core.exceptions import ObjectDoesNotExist
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_verification import ReportVerification
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_result import (
    ReportValidationResult,
)
from reporting.service.report_verification_service import ReportVerificationService


def validate(report_version: ReportVersion) -> ReportValidationResult:
    # Check if verification is mandatory
    isVerificationMandatory = ReportVerificationService.get_report_needs_verification(report_version.id)

    errors = {}

    if isVerificationMandatory:
        # Check for the ReportVerification entry
        try:
            ReportVerification.objects.get(report_version_id=report_version.id)  # attempt to get the object.
        except ObjectDoesNotExist:
            errors["missing_report_verification"] = "Report verification form not found in the report."

        # Check for the attachment only if mandatory
        try:
            ReportAttachment.objects.get(
                report_version_id=report_version.id,
                attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
            )
        except ReportAttachment.DoesNotExist:
            errors[
                "verififcation_statement"
            ] = "Mandatory verification statement document was not uploaded with this report."

    return ReportValidationResult(valid=not errors, errors=errors)
