from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from service.operation_service import OperationService
from registration.schema import OperationInformationIn, OperationUpdateOut, OperationRegistrationOut, Message
from service.operation_service_v2 import OperationServiceV2
from registration.constants import OPERATION_TAGS
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Operation
from registration.api.router import router


##### GET #####
@router.get(
    "/operations/{uuid:operation_id}/registration/operation",
    response={200: OperationRegistrationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Gets the registration purpose, regulated products (if applicable), and select data of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can access operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
    exclude_none=True,
)
def register_get_operation_information(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


##### PUT #####


@router.put(
    "/operations/{uuid:operation_id}/registration/operation",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the registration purpose and regulated products (if applicable) of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
def register_edit_operation_information(
    request: HttpRequest, operation_id: UUID, payload: OperationInformationIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.register_operation_information(get_current_user_guid(request), operation_id, payload)
