import os
from ninja import ModelSchema
from reporting.models.report_attachment import ReportAttachment


class ReportAttachmentOut(ModelSchema):

    file_name: str

    @staticmethod
    def resolve_file_name(obj):
        return os.path.basename(obj.attachment.name)

    class Meta:
        model = ReportAttachment
        fields = ['id', 'attachment_type']
