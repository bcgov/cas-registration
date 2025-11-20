from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.opted_out_operation_detail import OptedOutOperationDetail
from registration.schema import Message, OptedOutOperationDetailIn, OptedOutOperationDetailOut
from service.operation_service import OperationService
from registration.constants import OPERATION_TAGS
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router

# ****** PUT *********
@router.put(
    "/operations/{uuid:operation_id}/registration/opted-out-operation-detail",
    response={200: OptedOutOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the opted-out operation details of a specific operation by its ID.
    The endpoint ensures that only authorized internal users can update the opted-out information of an operation. Unauthorized access attempts raise an error.""",
    auth=authorize('cas_director'),
)
def operation_registration_update_opted_out_operation_detail(
    request: HttpRequest, operation_id: UUID, payload: OptedOutOperationDetailIn
) -> Tuple[Literal[200, 400], OptedOutOperationDetail]:
    return 200, OperationService.update_opted_out_operation_detail(
        get_current_user_guid(request), operation_id, payload
    )


# ******* POST *********
@router.post(
    "/operations/{uuid:operation_id}/registration/opted-out-operation-detail",
    response={200: OptedOutOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Creates a new opted-out operation details record for the operation specified by its ID.
    The endpoint ensures that only authorized internal users can add opted-out information for an operation. Unauthorized access attempts raise an error.""",
    auth=authorize('cas_director'),
)
def operation_registration_create_opted_out_operation_detail(
    request: HttpRequest, operation_id: UUID, payload: OptedOutOperationDetailIn
) -> Tuple[Literal[200, 400], OptedOutOperationDetailOut]:
    print(f"\n\n\n\n\n{payload}\n\n\n")
    return 200, OperationService.create_opted_out_operation_detail(
        get_current_user_guid(request), operation_id, payload
    )
