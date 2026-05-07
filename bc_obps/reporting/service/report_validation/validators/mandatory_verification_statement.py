from typing import ClassVar
from django.core.exceptions import ObjectDoesNotExist
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_verification import ReportVerification
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_verification_service import ReportVerificationService
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.base import ReportValidator
from reporting.service.reporting_flow_service import ReportingFlow


class MandatoryVerificationStatementValidator(ReportValidator):
    """
    Validates that the report meets necessary verification statement requirements before submission:
        - If report verification is required, ensures that a `ReportVerification` entry exists.
        - If a verification statement is required, ensures the presence of a corresponding attachment.
    """

    TAGS: ClassVar[list[ValidationTags]] = [ValidationTags.ON_SUBMIT]

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        is_verification_mandatory = ReportVerificationService.get_report_verification_status(
            report_version.id,
        ).get("verification_required")

        errors: dict[str, ReportValidationError] = {}

        if not is_verification_mandatory:
            return errors

        try:
            ReportVerification.objects.get(report_version_id=report_version.id)
        except ObjectDoesNotExist:
            errors["missing_report_verification"] = ReportValidationError(
                severity=Severity.ERROR,
                message="Verification information must be completed on the Verification page.",
                key=ReportValidationErrorKey.MISSING_REPORT_VERIFICATION,
                context=ErrorContext(report_version_id=report_version.id),
            )

        # Check for the attachment only if mandatory
        try:
            ReportAttachment.objects.get(
                report_version_id=report_version.id,
                attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
            )
        except ReportAttachment.DoesNotExist:
            errors["verification_statement"] = ReportValidationError(
                severity=Severity.ERROR,
                message="A verification statement must be uploaded with this report on the Attachments page.",
                key=ReportValidationErrorKey.VERIFICATION_STATEMENT,
                context=ErrorContext(report_version_id=report_version.id),
            )

        return errors
