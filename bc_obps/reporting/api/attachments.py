from typing import List, Literal, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest, StreamingHttpResponse
from ninja import File, Form, UploadedFile
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models import report_version
from reporting.models.report_attachment import ReportAttachment
from reporting.schema.generic import Message
from reporting.schema.report_attachment import ReportAttachmentOut
from service.error_service import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{report_version_id}/attachments",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the reporting attachments, passed as text in the payload.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_report_attachments(
    request: HttpRequest,
    report_version_id: int,
    file_types: Form[List[str]],
    files: List[UploadedFile] = File(...),
) -> Literal[200]:

    print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    for f in files:
        print(f)
    print("~~~")
    for n in file_types:
        print(n)

    for index, file_type in enumerate(file_types):
        ReportAttachment.objects.filter(report_version_id=report_version_id, attachment_type=file_type).delete()

        attachment = ReportAttachment(
            report_version_id=report_version_id,
            attachment=files[index],
            attachment_type=file_type,
        )
        attachment.save()
        attachment.set_create_or_update(get_current_user_guid(request))

    return 200


@router.get("report-version/{report_version_id}/attachments")
def load_report_attachments(
    request: HttpRequest,
    report_version_id: int,
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:
    return ReportAttachment.objects.filter(report_version_id=report_version_id)


@router.get("report-version/{report_version_id}/attachments/{file_id}")
def download_report_attachment_file(request: HttpRequest, report_version_id: int, file_id: int):

    file = ReportAttachment.objects.get(id=file_id, report_version_id=report_version_id)

    response = StreamingHttpResponse(streaming_content=file)
    response['Content-Disposition'] = f'attachment; filename={file.name}'
