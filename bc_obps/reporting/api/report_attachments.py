from typing import List, Literal, Optional, Tuple
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
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


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
    confirm_supplementary_existing_attachments_relevant: Optional[bool] = Form(None),
    confirm_supplementary_required_attachments_uploaded: Optional[bool] = Form(None),
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:

    if len(file_types) != len(files):
        raise IndexError("file_types and files parameters must be of the same length")

    user_guid = get_current_user_guid(request)

    for index, file_type in enumerate(file_types):
        file = files[index]
        ReportAttachmentService.set_attachment(version_id, user_guid, file_type, file)

    # Save confirmation values only if they are provided
    if confirm_supplementary_existing_attachments_relevant is not None or confirm_supplementary_required_attachments_uploaded is not None:
        ReportAttachmentService.save_attachment_confirmations(
            version_id,
            confirm_required_uploaded=confirm_supplementary_required_attachments_uploaded,
            confirm_existing_relevant=confirm_supplementary_existing_attachments_relevant,
        )
        
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
