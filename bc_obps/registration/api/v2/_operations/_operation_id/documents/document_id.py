from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from ninja import File, UploadedFile
from registration.constants import OPERATOR_TAGS
from registration.schema.v2.operator import OperatorOut
from service.data_access_service.document_service_v2 import DocumentDataAccessServiceV2
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.api.router import router
from registration.models import Operator
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message

class Document:
    file: UploadedFile = File(...)

@router.get(
    "/operations/{uuid:operation_id}/documents/{uuid:document_type}",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Retrieves a document""",
    auth=authorize("approved_authorized_roles"),
)
def get_operation_doucment(request: HttpRequest, operation_id: UUID, document_type: UUID) -> Tuple[Literal[200], Operator]:
    return 200, DocumentDataAccessServiceV2.get_operation_document_by_type(operation_id, document_type)
