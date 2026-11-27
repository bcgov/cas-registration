from uuid import UUID

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import OPERATION_TAGS
from registration.models.contact import Contact
from registration.schema import Message, OperationRepresentativeListOut
from registration.service.contact_service import ContactService


@router.get(
    "/operations/{uuid:operation_id}/operation-representatives",
    response={200: list[OperationRepresentativeListOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the list of operation representatives associated with the operation.""",
    auth=authorize(
        "approved_authorized_roles",
    ),
)
def list_operation_representatives(
    request: HttpRequest,
    operation_id: UUID,
) -> QuerySet[Contact]:
    return ContactService.list_operation_representatives(
        operation_id, get_current_user_guid(request)
    )
