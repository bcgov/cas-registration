from uuid import UUID
from django.core.files.base import ContentFile

from reporting.models.report_version import ReportVersion
from reporting.service.report_attachment_service import ReportAttachmentService


def create_report_verification_statement_attachment(
    report_version: ReportVersion,
    submitting_user: UUID,
):
    """
    Creates a verification statement attachment and marks it as Clean.
    """
    ReportAttachmentService.set_attachment(
        report_version.id,
        submitting_user,
        "verification_statement",
        ContentFile(b"data1", "file1.pdf"),
    )

    attachment = ReportAttachmentService.get_attachments_by_version(report_version.id).first()

    if attachment:
        attachment.status = 'Clean'
        attachment.save()
