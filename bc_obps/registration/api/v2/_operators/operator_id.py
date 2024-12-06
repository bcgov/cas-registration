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
