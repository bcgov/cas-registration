from typing import Literal, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest
from ninja import File, Form, UploadedFile
from registration.models.document import Document
from registration.models.document_type import DocumentType
from registration.schema.v2.document import DocumentOut
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ..router import router


@router.post(
    "/documents",
    response={200: DocumentOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the operation registration attachments, passed as text in the payload.""",
    auth=authorize("approved_industry_user"),
)
@transaction.atomic()
def save_registration_document(
    request: HttpRequest,
    # operation_id: int,
    document_type: Form[str],
    file: UploadedFile = File(...),
) -> Tuple[Literal[200], DocumentOut]:
    user_guid = get_current_user_guid(request)

    document_type_name = document_type.replace(" ", "_").lower()

    document = Document.objects.create(
        file=file,
        type=DocumentType.objects.get(name=document_type_name),
        created_by_id=user_guid,
    )

    return DocumentOut(document)
