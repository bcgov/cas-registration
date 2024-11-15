from typing import List, Literal, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest
from ninja import File, Form, UploadedFile
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_attachment import ReportAttachment
from reporting.schema.generic import Message
from reporting.schema.report_attachment import ReportAttachmentOut
from service.error_service import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{report_version_id}/attachments",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the reporting attachments, passed as text in the payload.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
@transaction.atomic()
def save_report_attachments(
    request: HttpRequest,
    report_version_id: int,
    file_types: Form[List[str]],
    files: List[UploadedFile] = File(...),
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:

    if len(file_types) != len(files):
        raise IndexError("file_types and files parameters must be of the same length")

    for index, file_type in enumerate(file_types):

        report_attachment: ReportAttachment | None = ReportAttachment.objects.filter(
            report_version_id=report_version_id, attachment_type=file_type
        ).first()

        # Delete file from storage then from the db
        if report_attachment:
            report_attachment.attachment.delete(save=False)
            report_attachment.delete()

        file = files[index]

        attachment = ReportAttachment(
            report_version_id=report_version_id,
            attachment=file,
            attachment_type=file_type,
            attachment_name=file.name or "attachment",
        )
        attachment.save()
        attachment.set_create_or_update(get_current_user_guid(request))

    return load_report_attachments(request, report_version_id)


@router.get(
    "report-version/{report_version_id}/attachments",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the list of file attachments for a report version.""",
    auth=authorize("approved_industry_user"),
)
def load_report_attachments(
    request: HttpRequest,
    report_version_id: int,
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:
    attachments_data = ReportAttachment.objects.filter(report_version_id=report_version_id).all()
    return 200, attachments_data  # type: ignore
