from typing import ClassVar
from django.core.exceptions import ObjectDoesNotExist
from service.report_version_service import ReportVersionService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.base import ReportValidator
from reporting.service.reporting_flow_service import ReportingFlow


class SupplementaryReportAttachmentsConfirmationValidator(ReportValidator):
    """
    Validates that if the report is supplementary, the user has confirmed the necessary attachment requirements:
        - Confirms that required supplementary attachments have been uploaded.
        - Confirms that existing attachments are still relevant.
    """

    TAGS: ClassVar[list[ValidationTags]] = [ValidationTags.ON_SUBMIT]

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        if ReportVersionService.is_initial_report_version(report_version.id):
            return {}

        errors: dict[str, ReportValidationError] = {}

        try:
            attachment_confirmation = ReportAttachmentConfirmation.objects.get(report_version_id=report_version.id)
        except ObjectDoesNotExist:
            errors["missing_supplementary_report_attachments_confirmation"] = ReportValidationError(
                Severity.ERROR,
                (
                    "You must confirm that all required supplementary attachments have been uploaded "
                    "and existing attachments are still relevant to the supplementary submission on "
                    "the Attachments page."
                ),
                key=ReportValidationErrorKey.MISSING_SUPPLEMENTARY_REPORT_ATTACHMENTS_CONFIRMATION,
                context=ErrorContext(report_version_id=report_version.id),
            )
            return errors

        # Validate confirmation for required attachments
        if not attachment_confirmation.confirm_supplementary_required_attachments_uploaded:
            errors["missing_supplementary_report_required_attachment_confirmation"] = ReportValidationError(
                Severity.ERROR,
                (
                    "You must confirm that all required supplementary attachments have been uploaded "
                    "on the Attachments page."
                ),
                key=ReportValidationErrorKey.MISSING_SUPPLEMENTARY_REPORT_REQUIRED_ATTACHMENT_CONFIRMATION,
                context=ErrorContext(report_version_id=report_version.id),
            )

        if not attachment_confirmation.confirm_supplementary_existing_attachments_relevant:
            errors["missing_supplementary_report_existing_attachment_confirmation"] = ReportValidationError(
                Severity.ERROR,
                (
                    "You must confirm that all existing attachments are still relevant to the "
                    "supplementary submission on the Attachments page."
                ),
                key=ReportValidationErrorKey.MISSING_SUPPLEMENTARY_REPORT_EXISTING_ATTACHMENT_CONFIRMATION,
                context=ErrorContext(report_version_id=report_version.id),
            )

        return errors
