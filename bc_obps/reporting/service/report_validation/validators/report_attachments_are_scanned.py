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

TAGS = [ValidationTags.ON_SUBMIT]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    report_attachments: QuerySet[ReportAttachment] = report_version.report_attachments.all()

    errors = {}

    for a in report_attachments:
        if a.status != ReportAttachment.FileStatus.CLEAN:
            errors[f"attachment_{a.attachment_type}"] = ReportValidationError(
                Severity.ERROR,
                f"Your {a.attachment_type} attachment is being scanned for security. This may take a few minutes, please wait before submitting.",
                key=ReportValidationErrorKey.ATTACHMENT_NOT_SCANNED,
                context=ErrorContext(report_version_id=report_version.id),
            )

    return errors
