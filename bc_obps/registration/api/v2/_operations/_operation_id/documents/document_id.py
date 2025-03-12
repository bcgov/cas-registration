from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from ninja import File, UploadedFile
from registration.constants import OPERATOR_TAGS
from registration.models.document import Document
from service.data_access_service.document_service_v2 import DocumentDataAccessServiceV2
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message


class DocumentOut:
    file: UploadedFile = File(...)


@router.get(
    "/operations/{uuid:operation_id}/documents/{uuid:document_type}",
    response={200: DocumentOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Retrieves the most recent version of a document for the specified operation and document type.""",
    auth=authorize("approved_authorized_roles"),
)
def get_operation_document(
    request: HttpRequest, operation_id: UUID, document_type: str
) -> Tuple[Literal[200], Document | None]:
    return 200, DocumentDataAccessServiceV2.get_operation_document_by_type(operation_id, document_type)
