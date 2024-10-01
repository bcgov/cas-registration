from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.schema.v2.operation import (
    OperationInformationIn,
    OperationUpdateOut,
)
from service.operation_service_v2 import OperationServiceV2
from registration.constants import V2
from common.permissions import authorize
from registration.api.utils.current_user_utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Operation
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message


##### PUT #####


@router.put(
    "/v2/operations/{operation_id}/registration/operation",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Updates the registration purpose and regulated products (if applicable) of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
@handle_http_errors()
def register_edit_operation_information(
    request: HttpRequest, operation_id: UUID, payload: OperationInformationIn
) -> Tuple[Literal[200], Operation]:
    # raise Exception('d')
    return 200, OperationServiceV2.register_operation_information(get_current_user_guid(request), operation_id, payload)
