from ninja import ModelSchema
from reporting.models.report_attachment import ReportAttachment


class ReportAttachmentOut(ModelSchema):
    url: str

    class Meta:
        model = ReportAttachment
        fields = ["id", "attachment_type", "attachment_name"]

    @staticmethod
    def resolve_url(obj: ReportAttachment) -> str:
        return obj.get_file_url() or ""
