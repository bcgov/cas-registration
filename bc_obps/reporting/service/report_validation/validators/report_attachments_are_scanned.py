from django.db.models import QuerySet
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    report_attachments: QuerySet[ReportAttachment] = report_version.report_attachments.all()

    errors = {}

    for a in report_attachments:
        if a.status != ReportAttachment.FileStatus.CLEAN:
            errors[f"attachment_{a.attachment_type}"] = ReportValidationError(
                Severity.ERROR,
                f"The {a.attachment_type} file hasn't been scanned yet, try resubmitting in a few minutes.",
            )

    return errors
