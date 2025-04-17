from typing import Optional
from uuid import UUID
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from django.db.models import QuerySet
from reporting.constants import MAX_UPLOAD_SIZE
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation


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
            raise ValidationError(f"File attachment cannot exceed {MAX_UPLOAD_SIZE} bytes.")

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

    @classmethod
    def get_attachments(cls, report_version_id: int) -> QuerySet[ReportAttachment]:
        return ReportAttachment.objects.filter(report_version_id=report_version_id).all()

    @classmethod
    def get_attachment(cls, report_version_id: int, attachment_id: int) -> ReportAttachment:
        return ReportAttachment.objects.get(report_version_id=report_version_id, id=attachment_id)

    @classmethod
    def save_attachment_confirmation(
        cls,
        report_version_id: int,
        confirm_required_uploaded: bool,
        confirm_existing_relevant: bool,
    ) -> None:
        """
        Saves the attachment confirmation information for a supplementary report version.
        """
        default_confirmations = {
            "confirm_supplementary_required_attachments_uploaded": confirm_required_uploaded,
            "confirm_supplementary_existing_attachments_relevant": confirm_existing_relevant,
        }

        # Create or update the confirmation record
        ReportAttachmentConfirmation.objects.update_or_create(
            report_version_id=report_version_id,
            defaults=default_confirmations,
        )

    @classmethod
    def get_attachment_confirmation(cls, report_version_id: int) -> Optional[ReportAttachmentConfirmation]:
        """
        Retrieves the attachment confirmation record for a supplementary report version.
        Returns None if no confirmation exists.
        """
        try:
            return ReportAttachmentConfirmation.objects.get(report_version_id=report_version_id)
        except ReportAttachmentConfirmation.DoesNotExist:
            return None  # include the absence of confirmation as part of a successful 200 OK response
