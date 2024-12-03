from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.models import Operator
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.v1 import ConfirmSelectedOperatorOut
from registration.schema.generic import Message
from common.api.utils import get_current_user_guid
from service.operator_service import OperatorService
from registration.schema.v1 import OperatorOut, OperatorIn

# We have to let unapproved users to reach this endpoint otherwise they can't see operator info when they select it


@router.get(
    "/operators/{uuid:operator_id}",
    response={200: ConfirmSelectedOperatorOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Retrieves information about a specific operator by its ID.
    This endpoint is accessible to both approved and unapproved users, allowing them to view operator information when selected.""",
    auth=authorize("authorized_roles"),
)
@handle_http_errors()
def get_operator(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[200], Operator]:
    return 200, OperatorDataAccessService.get_operator_by_id(operator_id)


@router.put(
    "/operators/{uuid:operator_id}",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Updates the status of a specific operator by its ID.
    The endpoint allows authorized users to update the operator's status and perform additional actions based on the new status.
    If the operator is new and declined, all associated user operators are also declined, and notifications are sent accordingly.""",
    auth=authorize("authorized_irc_user"),
)
@handle_http_errors()
def update_operator_status(
    request: HttpRequest, operator_id: UUID, payload: OperatorIn
) -> Tuple[Literal[200], Operator]:
    return 200, OperatorService.update_operator_status(get_current_user_guid(request), operator_id, payload)
