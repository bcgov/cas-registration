from typing import List, Literal, Tuple
from uuid import UUID
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest
from ninja import File, UploadedFile
from registration.constants import OPERATION_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_attachment import ReportAttachmentOut
from service.document_service_v2 import DocumentServiceV2
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router


@router.post(
    "registration/{operation_id}/documents",
    response={200: List[ReportAttachmentOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Saves the operation registration attachments, passed as text in the payload.""",
    auth=authorize("approved_industry_user"),
)
@transaction.atomic()
def save_registration_document(
    request: HttpRequest,
    operation_id: UUID,
    document_type: str,
    file: UploadedFile = File(...),
) -> Tuple[Literal[200], ReportAttachmentOut]:
    # FIXME returns ReportAttachmentOut, which is schema for ReportAttachment model - fields aren't relevant to registration docs
    user_guid = get_current_user_guid(request)

    DocumentServiceV2.create_or_replace_operation_document(user_guid, operation_id, file, document_type)

    return get_registration_document_by_type(request, operation_id, document_type)


@router.get(
    "registration/{operation_id}/documents",
    response={200: DocumentOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Returns the document of the specified type for the specified operation.""",
    auth=authorize("approved_industry_user"),
)
def get_registration_document_by_type(
    request: HttpRequest,
    operation_id: UUID,
    document_type: str,
) -> Tuple[Literal[200], List[ReportAttachmentOut]]:
    # FIXME - returns List of ReportAttachmentOuts - fields not relevant to registration docs
    return 200, DocumentServiceV2.get_operation_document_by_type_if_authorized(
        get_current_user_guid(request), operation_id, document_type
    )
