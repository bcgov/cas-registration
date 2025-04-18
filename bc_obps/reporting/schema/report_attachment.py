from ninja import ModelSchema
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation


class ReportAttachmentOut(ModelSchema):
    class Meta:
        model = ReportAttachment
        fields = ["id", "attachment_type", "attachment_name"]


class ReportAttachmentConfirmationOut(ModelSchema):
    class Meta:
        model = ReportAttachmentConfirmation
        fields = [
            "confirm_supplementary_required_attachments_uploaded",
            "confirm_supplementary_existing_attachments_relevant",
        ]
