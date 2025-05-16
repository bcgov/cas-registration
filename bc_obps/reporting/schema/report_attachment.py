from typing import List, Optional
from ninja import Field, FilterSchema, ModelSchema, Schema
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


class AttachmentsWithConfirmationOut(Schema):
    attachments: List[ReportAttachmentOut]
    confirmation: Optional[ReportAttachmentConfirmationOut]


class InternalReportAttachmentOut(ModelSchema):
    operator: str = Field(..., alias="report_version.report.operator.legal_name")
    operation: str = Field(..., alias="report_version.report.operation.name")
    report_version_id: int = Field(..., alias="report_version.id")

    class Meta:
        model = ReportAttachment
        fields = [
            "id",
            "attachment_type",
            "attachment_name",
        ]


class InternalReportAttachmentFilterSchema(FilterSchema):
    operator: Optional[str] = Field(
        None, json_schema_extra={"q": "report_version__report__operator__legal_name__icontains"}
    )
    operation: Optional[str] = Field(
        None, json_schema_extra={"q": "report_version__report__operation__name__icontains"}
    )
    report_version_id: Optional[int] = Field(None, json_schema_extra={"q": "report_version__id"})
    attachment_type: Optional[str] = Field(None, json_schema_extra={"q": "attachment_type__icontains"})
    attachment_name: Optional[str] = Field(None, json_schema_extra={"q": "attachment_name__icontains"})
