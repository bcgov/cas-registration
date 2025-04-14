from ninja import ModelSchema
from reporting.models.report_attachment import ReportAttachment


class ReportAttachmentOut(ModelSchema):
    class Meta:
        model = ReportAttachment
        fields = ['id', 'attachment_type', 'attachment_name', 'confirm_supplementary_required_attachments_uploaded', 'confirm_supplementary_existing_attachments_relevant']
