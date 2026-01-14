from typing import Annotated, List, Optional

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
    operator: Annotated[str | None, Field(q="report_version__report__operator__legal_name__icontains")] = None
    operation: Annotated[str | None, Field(q="report_version__report__operation__name__icontains")] = None
    report_version_id: Annotated[int | None, Field(q="report_version__id")] = None
    attachment_type: Annotated[str | None, Field(q="attachment_type__icontains")] = None
    attachment_name: Annotated[str | None, Field(q="attachment_name__icontains")] = None
