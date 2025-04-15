from uuid import UUID
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from django.db.models import QuerySet
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation
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
    def save_attachment_confirmations(
        cls,
        report_version_id: int,
        confirm_required_uploaded: bool | None,
        confirm_existing_relevant: bool | None,
    ) -> None:
        """
        Saves the attachment confirmation information for a report version.
        """
        # Only save non-None values
        clean_confirmations = {
            "confirm_supplementary_required_attachments_uploaded": confirm_required_uploaded,
            "confirm_supplementary_existing_attachments_relevant": confirm_existing_relevant,
        }

        # Filter out keys with None values
        clean_confirmations = {
            k: v for k, v in clean_confirmations.items() if v is not None
        }

        if clean_confirmations:
            # Create or update the confirmation record
            confirmation, created = ReportAttachmentConfirmation.objects.update_or_create(
                report_version_id=report_version_id,
                defaults=clean_confirmations,
            )