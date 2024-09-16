from typing import List, Literal, Tuple
from django.http import HttpRequest
from registration.models.operation import Operation
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.schema.v2.operation import (
    OperationCurrentOut,
)
from service.operation_service_v2 import OperationServiceV2
from registration.decorators import handle_http_errors
from registration.api.router import router
from common.permissions import authorize

from registration.schema.generic import Message
from ninja.responses import codes_4xx
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/v2/operations/current",
    response={200: List[OperationCurrentOut], codes_4xx: Message},
    tags=["V2"],
    auth=authorize('approved_industry_user'),
    description="""Gets the list of operations associated with the current user's operation that are not yet registered.
    The endpoint ensures that only authorized industry users can get unregistered operations belonging to their operator. Unauthorized access attempts raise an error.""",
)
@handle_http_errors()
def list_current_users_operations(request: HttpRequest) -> Tuple[Literal[200], QuerySet[Operation]]:
    return 200, OperationServiceV2.list_current_users_unregistered_operations(get_current_user_guid(request))
