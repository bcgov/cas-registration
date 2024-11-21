from typing import List, Literal, Optional
from registration.constants import V2
from registration.models.operation import Operation
from registration.schema.v2.operation import OperationFilterSchema, OperationListOut
from typing import Tuple
from registration.schema.v2.operation import OperationCreateOut, OperationInformationIn
from service.operation_service_v2 import OperationServiceV2
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from ninja.pagination import paginate
from registration.utils import CustomPagination

##### GET #####


@router.get(
    "/v2/operations",
    response={200: List[OperationListOut], custom_codes_4xx: Message},
    tags=V2,
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
@paginate(CustomPagination)
def list_operations_v2(
    request: HttpRequest,
    filters: OperationFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operation]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return OperationServiceV2.list_operations(get_current_user_guid(request), sort_field, sort_order, filters)


REGISTRATION_PURPOSES_LITERALS = Literal[
    Operation.Purposes.REPORTING_OPERATION,
    Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
    Operation.Purposes.NEW_ENTRANT_OPERATION,
    Operation.Purposes.OBPS_REGULATED_OPERATION,
    Operation.Purposes.OPTED_IN_OPERATION,
    Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
]


@router.get(
    "/v2/operations/registration-purposes",
    response={200: List[REGISTRATION_PURPOSES_LITERALS], custom_codes_4xx: Message},
    tags=V2,
    description="""Retrieves a list of strings representing the valid options for an operation's registration purpose (aka registration category).""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_registration_purposes(request: HttpRequest) -> Tuple[Literal[200], List[REGISTRATION_PURPOSES_LITERALS]]:
    purposes = [purpose for purpose in Operation.Purposes]
    return 200, purposes


##### POST #####
@router.post(
    "/v2/operations",
    response={200: OperationCreateOut, custom_codes_4xx: Message},
    tags=["V2"],
    description="""Creates a new operation for the current user and starts the registration process.
    It associates the new operation with the current user's approved user-operator.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def register_create_operation_information(
    request: HttpRequest, payload: OperationInformationIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.register_operation_information(get_current_user_guid(request), None, payload)
