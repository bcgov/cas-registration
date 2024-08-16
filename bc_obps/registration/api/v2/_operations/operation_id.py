from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from service.operation_service import OperationService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.models import Operation
from registration.schema.v2.operation import (
    OperationOut,
)
from registration.schema.generic import Message
from ninja.responses import codes_4xx


##### GET #####


@router.get(
    ## need to rename, this was causing errors when fetching /v2/operations/current
    "/v2/operation/{operation_id}",
    response={200: OperationOut, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID. The endpoint checks if the current user is authorized to access the operation.
    Industry users can only access operations they are permitted to view. If an unauthorized user attempts to access the operation, an error is raised.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_operation_v2(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)
