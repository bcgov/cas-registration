from typing import Literal, Optional, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.new_entrant_operation_detail import NewEntrantOperationDetail
from registration.schema.v2.operation import NewEntrantOperationDetailOut, NewEntrantOperationDetailIn
from service.operation_service_v2 import OperationServiceV2
from registration.constants import V2
from common.permissions import authorize
from registration.api.utils.current_user_utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message


@router.get(
    "/v2/operations/{uuid:operation_id}/registration/new-entrant-operation-detail",
    response={200: NewEntrantOperationDetailOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Get the new entrant operation details of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
@handle_http_errors()
def operation_registration_get_new_entrant_operation_detail(
    request: HttpRequest, operation_id: UUID
) -> Tuple[Literal[200], Optional[NewEntrantOperationDetail]]:
    return 200, OperationServiceV2.get_new_entrant_operation_detail(get_current_user_guid(request), operation_id)


@router.put(
    "/v2/operations/{uuid:operation_id}/registration/new-entrant-operation-detail",
    response={200: NewEntrantOperationDetailOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Updates the new entrant operation details of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
@handle_http_errors()
def operation_registration_update_new_entrant_operation_detail(
    request: HttpRequest, operation_id: UUID, payload: NewEntrantOperationDetailIn
) -> Tuple[Literal[200, 400], NewEntrantOperationDetail]:
    status_code, resp = 200, OperationServiceV2.update_new_entrant_operation_detail(
        get_current_user_guid(request), operation_id, payload
    )
    print(resp)
    return status_code, resp
