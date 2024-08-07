from typing import List, Literal, Tuple
from django.http import HttpRequest
from registration.models.operation import Operation
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.models import UserOperator
from registration.schema.v2.operation import (
    OperationCurrentOut,
)
from service.operation_service_v2 import OperationService
from registration.decorators import authorize, handle_http_errors
from registration.api.router import router


from registration.schema.generic import Message
from ninja.responses import codes_4xx
from django.db.models import QuerySet

##### GET #####


@router.get("/v2/operations/current", response={200: List[OperationCurrentOut], codes_4xx: Message}, tags=["V2"])
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def list_current_users_operations(request: HttpRequest) -> Tuple[Literal[200], QuerySet[Operation]]:
    return 200, OperationService.list_current_users_operations(get_current_user_guid(request))
