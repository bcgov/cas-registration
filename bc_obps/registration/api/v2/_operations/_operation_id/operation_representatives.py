from uuid import UUID
from common.permissions import authorize
from registration.api.router import router
from typing import List
from django.db.models import QuerySet
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import OPERATION_TAGS
from registration.models.contact import Contact
from registration.schema.v1.contact import OperationRepresentativeListOut
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from service.contact_service import ContactService
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/operations/{uuid:operation_id}/operation-representatives",
    response={200: List[OperationRepresentativeListOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the list of operation representatives associated with the operation.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def list_operation_representatives(
    request: HttpRequest,
    operation_id: UUID,
) -> QuerySet[Contact]:
    return ContactService.list_operation_representatives(operation_id, get_current_user_guid(request))
