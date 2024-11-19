from uuid import UUID
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from django.db.models import QuerySet
from reporting.constants import MAX_UPLOAD_SIZE
from reporting.models.report_attachment import ReportAttachment


class ReportAttachmentService:
    @classmethod
    def set_attachment(
        cls,
        report_version_id: int,
        user_guid: UUID,
        attachment_type: str,
        attachment_file: UploadedFile,
    ) -> None:
        if attachment_file.size and attachment_file.size > MAX_UPLOAD_SIZE:
            raise ValidationError(f"File attachment size shall not exceed {MAX_UPLOAD_SIZE} bytes.")

        report_attachment = ReportAttachment.objects.filter(
            report_version_id=report_version_id,
            attachment_type=attachment_type,
        ).first()

        # Delete file from storage then from the db
        if report_attachment:
            report_attachment.attachment.delete(save=False)
            report_attachment.delete()

        attachment = ReportAttachment(
            report_version_id=report_version_id,
            attachment=attachment_file,
            attachment_type=attachment_type,
            attachment_name=attachment_file.name or "attachment",
        )
        attachment.save()
        attachment.set_create_or_update(user_guid)

    @classmethod
    def get_attachments(cls, report_version_id: int) -> QuerySet[ReportAttachment]:
        return ReportAttachment.objects.filter(report_version_id=report_version_id).all()
