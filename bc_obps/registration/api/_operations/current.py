from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import OPERATION_TAGS
from registration.models.operation import Operation
from registration.schema import Message, OperationCurrentOut
from registration.service.operation_service import OperationService

##### GET #####


@router.get(
    "/operations/current",
    response={200: list[OperationCurrentOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    auth=authorize("approved_industry_user"),
    description="""Gets the list of operations associated with the current user's operator that are not yet registered.
    The endpoint ensures that only authorized industry users can get unregistered operations belonging to their operator. Unauthorized access attempts raise an error.""",
)
def list_current_users_operations(
    request: HttpRequest,
) -> tuple[Literal[200], QuerySet[Operation]]:
    return 200, OperationService.list_current_users_unregistered_operations(
        get_current_user_guid(request)
    )
