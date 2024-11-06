from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.contact import Contact
from registration.schema.v2.operation import OperationRepresentativeIn, OperationRepresentativeOut
from service.operation_service_v2 import OperationServiceV2
from registration.constants import V2
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.api.router import router
from common.permissions import authorize
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.post(
    "/v2/operations/{uuid:operation_id}/registration/operation-representative",
    response={200: OperationRepresentativeOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Updates an operation with operation representative(s). User may create new contact to use as representatives if desired or use existing contacts.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_operation_representative(
    request: HttpRequest, operation_id: UUID, payload: OperationRepresentativeIn
) -> Tuple[Literal[200], Contact]:
    return 200, OperationServiceV2.create_operation_representative(
        get_current_user_guid(request), operation_id, payload
    )
