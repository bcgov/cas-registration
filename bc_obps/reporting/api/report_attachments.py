from typing import List, Literal, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest
from ninja import File, Form, UploadedFile
from reporting.api.permissions import check_version_ownership_in_url
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_attachment import ReportAttachmentOut
from reporting.service.report_attachment_service import ReportAttachmentService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{report_version_id}/attachments",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the reporting attachments, passed as text in the payload.""",
    auth=authorize("approved_industry_user", check_version_ownership_in_url("report_version_id")),
)
@transaction.atomic()
def save_report_attachments(
    request: HttpRequest,
    report_version_id: int,
    file_types: Form[List[str]],
    files: List[UploadedFile] = File(...),
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:

    if len(file_types) != len(files):
        raise IndexError("file_types and files parameters must be of the same length")

    user_guid = get_current_user_guid(request)

    for index, file_type in enumerate(file_types):
        file = files[index]
        ReportAttachmentService.set_attachment(report_version_id, user_guid, file_type, file)

    return get_report_attachments(request, report_version_id)


@router.get(
    "report-version/{report_version_id}/attachments",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the list of file attachments for a report version.""",
    auth=authorize("approved_industry_user", check_version_ownership_in_url("report_version_id")),
)
def get_report_attachments(
    request: HttpRequest,
    report_version_id: int,
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:

    return 200, ReportAttachmentService.get_attachments(report_version_id)  # type: ignore
