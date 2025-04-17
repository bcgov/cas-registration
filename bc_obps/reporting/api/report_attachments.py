from typing import List, Literal, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from django.db import transaction
from django.http import HttpRequest
from ninja import File, Form, UploadedFile
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_attachment import ReportAttachmentOut
from reporting.service.report_attachment_service import ReportAttachmentService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
)


@router.post(
    "report-version/{version_id}/attachments",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the reporting attachments, passed as text in the payload.""",
    auth=approved_industry_user_report_version_composite_auth,
)
@transaction.atomic()
def save_report_attachments(
    request: HttpRequest,
    version_id: int,
    file_types: Form[List[str]],
    files: List[UploadedFile] = File(...),
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:
    if len(file_types) != len(files):
        raise IndexError("file_types and files parameters must be of the same length")

    user_guid = get_current_user_guid(request)

    for index, file_type in enumerate(file_types):
        file = files[index]
        ReportAttachmentService.set_attachment(version_id, user_guid, file_type, file)

    return get_report_attachments(request, version_id)


@router.get(
    "report-version/{version_id}/attachments",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the list of file attachments for a report version.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_attachments(
    request: HttpRequest,
    version_id: int,
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:
    return 200, ReportAttachmentService.get_attachments(version_id)  # type: ignore


@router.get(
    "report-version/{version_id}/attachments/{file_id}",
    response={200: str, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the cloud download URL for a file attachment.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_file_url(request: HttpRequest, version_id: int, file_id: int) -> Tuple[Literal[200], str]:
    return 200, ReportAttachmentService.get_attachment(version_id, file_id).get_file_url()
