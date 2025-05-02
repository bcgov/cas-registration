from typing import List, Literal, Optional, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from django.db import transaction
from django.http import HttpRequest
from ninja import File, Form, UploadedFile
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_attachment import AttachmentsWithConfirmationOut
from reporting.service.report_attachment_service import ReportAttachmentService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
)


@router.post(
    "report-version/{version_id}/attachments",
    response={200: AttachmentsWithConfirmationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Saves both attachments and supplementary report confirmation flags",
    auth=approved_industry_user_report_version_composite_auth,
)
@transaction.atomic()
def save_report_attachments(
    request: HttpRequest,
    version_id: int,
    file_types: Optional[List[str]] = Form(None),
    files: Optional[List[UploadedFile]] = File(None),
    confirm_supplementary_existing_attachments_relevant: Optional[bool] = Form(None),
    confirm_supplementary_required_attachments_uploaded: Optional[bool] = Form(None),
) -> Tuple[int, dict]:

    # Handle files if they were supplied
    if files is not None:
        if file_types is None or len(file_types) != len(files):
            raise IndexError("file_types and files parameters must be of the same length")
        user_guid = get_current_user_guid(request)
        for ftype, file in zip(file_types, files):
            ReportAttachmentService.set_attachment(version_id, user_guid, ftype, file)

    # Handle supplementary report confirmation flags if supplied
    if (
        confirm_supplementary_existing_attachments_relevant is not None
        or confirm_supplementary_required_attachments_uploaded is not None
    ):
        ReportAttachmentService.save_attachment_confirmation(
            report_version_id=version_id,
            confirm_existing_relevant=bool(confirm_supplementary_existing_attachments_relevant),
            confirm_required_uploaded=bool(confirm_supplementary_required_attachments_uploaded),
        )

    return get_report_attachments(request, version_id)


@router.get(
    "report-version/{version_id}/attachments",
    response={200: AttachmentsWithConfirmationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Returns both the attachments and (if any) the supplementary report confirmation.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_attachments(
    request: HttpRequest,
    version_id: int,
) -> Tuple[int, dict]:
    attachments = ReportAttachmentService.get_attachments(version_id)
    confirmation = ReportAttachmentService.get_attachment_confirmation(version_id)

    response_data = {
        "attachments": attachments,
        "confirmation": confirmation,
    }
    return 200, response_data


@router.get(
    "report-version/{version_id}/attachments/{file_id}",
    response={200: str, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the cloud download URL for a file attachment.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_attachment_url(request: HttpRequest, version_id: int, file_id: int) -> Tuple[Literal[200], str]:
    return 200, ReportAttachmentService.get_attachment(version_id, file_id).get_file_url()
