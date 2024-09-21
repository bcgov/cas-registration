from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.schema.v2.operation import OperationRepresentativeIn
from registration.schema.v2.operation import OperationUpdateOut
from service.operation_service_v2 import OperationServiceV2
from registration.constants import V2
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.models import Operation
from common.permissions import authorize
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


# TODO: update tests for this endpoint
@router.put(
    "/v2/operations/{uuid:operation_id}/registration/operation-representative",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Updates an operation with operation representative(s). User may create new contact to use as representatives if desired or use existing contacts.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def register_operation_operation_representative(
    request: HttpRequest, operation_id: UUID, payload: OperationRepresentativeIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.register_operation_operation_representative(
        get_current_user_guid(request), operation_id, payload
    )
