from uuid import UUID
from common.permissions import authorize
from registration.api.router import router
from typing import List
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from registration.models.contact import Contact
from registration.schema.v1.contact import OperationsContactListOut
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


# TODO: Add tests for this endpoint
@router.get(
    "/operations/{operation_id}/contacts",
    response={200: List[OperationsContactListOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the list of contacts associated with the operation.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def list_operations_contacts(
    request: HttpRequest,
    operation_id: UUID,
) -> QuerySet[Contact]:
    # return ContactService.list_operations_contacts(operation_id, get_current_user_guid(request))
    return Contact.objects.all()