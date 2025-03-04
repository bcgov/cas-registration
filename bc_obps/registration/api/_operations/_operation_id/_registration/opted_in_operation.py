from typing import Literal, Optional, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.schema import (
    OptedInOperationDetailIn,
    OptedInOperationDetailOut,
    Message
)
from service.operation_service_v2 import OperationServiceV2
from registration.constants import OPERATION_TAGS
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router


@router.get(
    "/operations/{uuid:operation_id}/registration/opted-in-operation-detail",
    response={200: OptedInOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Get the opted-in operation details of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
def operation_registration_get_opted_in_operation_detail(
    request: HttpRequest, operation_id: UUID
) -> Tuple[Literal[200], Optional[OptedInOperationDetail]]:
    return 200, OperationServiceV2.get_opted_in_operation_detail(get_current_user_guid(request), operation_id)


@router.put(
    "/operations/{uuid:operation_id}/registration/opted-in-operation-detail",
    response={200: OptedInOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the opted-in operation details of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
def operation_registration_update_opted_in_operation_detail(
    request: HttpRequest, operation_id: UUID, payload: OptedInOperationDetailIn
) -> Tuple[Literal[200, 400], OptedInOperationDetail]:
    return 200, OperationServiceV2.update_opted_in_operation_detail(
        get_current_user_guid(request), operation_id, payload
    )
