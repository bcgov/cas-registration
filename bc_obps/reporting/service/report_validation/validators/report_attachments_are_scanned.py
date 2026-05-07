from typing import ClassVar
from django.db.models import QuerySet
from reporting.models.report_attachment import ReportAttachment
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


class ReportAttachmentsAreScannedValidator(ReportValidator):
    TAGS: ClassVar[list[ValidationTags]] = [ValidationTags.ON_SUBMIT]

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        report_attachments: QuerySet[ReportAttachment] = report_version.report_attachments.all()

        errors: dict[str, ReportValidationError] = {}

        for attachment in report_attachments:
            if attachment.status != ReportAttachment.FileStatus.CLEAN:
                errors[f"attachment_{attachment.attachment_type}"] = ReportValidationError(
                    Severity.ERROR,
                    f"Your {attachment.attachment_type} attachment is being scanned for security. "
                    "This may take a few minutes, please wait before submitting.",
                    key=ReportValidationErrorKey.ATTACHMENT_NOT_SCANNED,
                    context=ErrorContext(report_version_id=report_version.id),
                )

        return errors
