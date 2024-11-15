from ninja import Schema
from reporting.models.report_attachment import ReportAttachment


class ReportAttachmentOut(Schema):

    class Meta:
        model = ReportAttachment
        fields = ['id', 'attachment', 'attachment_type']
