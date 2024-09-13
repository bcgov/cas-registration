from typing import Literal, Tuple
from uuid import UUID
from registration.schema.v2.operation import OperationOutV2
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from service.operation_service import OperationService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.models import Operation
from registration.schema.generic import Message
from ninja.responses import codes_4xx


##### GET #####


@router.get(
    "/v2/operations/{uuid:operation_id}",
    response={200: OperationOutV2, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID. Unlike the v1 endpoint, this endpoint does not
    return the statutory_declaration field as it can be quite large and cause slow requests. If you need the statutory_declaration field,
    use the  operations/{operation_id}/registration/statutory-declaration endpoint or v1 of this endpoint""",
    exclude_none=True,
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_operation_v2(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)
