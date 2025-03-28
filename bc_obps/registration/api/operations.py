from typing import List, Literal, Optional
from registration.constants import OPERATION_TAGS
from registration.models.operation import Operation
from typing import Tuple
from registration.schema import (
    OperationCreateOut,
    OperationInformationIn,
    Message,
    OperationTimelineFilterSchema,
    OperationTimelineListOut,
)
from service.operation_service import OperationService
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from ninja.pagination import paginate
from registration.utils import CustomPagination
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline


##### GET #####


@router.get(
    "/operations",
    response={200: List[OperationTimelineListOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_operations(
    request: HttpRequest,
    filters: OperationTimelineFilterSchema = Query(...),
    sort_field: Optional[str] = "operation__created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[OperationDesignatedOperatorTimeline]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return OperationService.list_operations_timeline(get_current_user_guid(request), sort_field, sort_order, filters)


REGISTRATION_PURPOSES_LITERALS = Literal[
    Operation.Purposes.REPORTING_OPERATION,
    Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
    Operation.Purposes.NEW_ENTRANT_OPERATION,
    Operation.Purposes.OBPS_REGULATED_OPERATION,
    Operation.Purposes.OPTED_IN_OPERATION,
    Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
]


@router.get(
    "/operations/registration-purposes",
    response={200: List[REGISTRATION_PURPOSES_LITERALS], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves a list of strings representing the valid options for an operation's registration purpose (aka registration category).""",
    auth=authorize("approved_authorized_roles"),
)
def get_registration_purposes(request: HttpRequest) -> Tuple[Literal[200], List[REGISTRATION_PURPOSES_LITERALS]]:
    purposes = [purpose for purpose in Operation.Purposes]
    return 200, purposes


##### POST #####
@router.post(
    "/operations",
    response={201: OperationCreateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Creates a new operation for the current user and starts the registration process.
    It associates the new operation with the current user's approved user-operator.""",
    auth=authorize("approved_industry_user"),
)
def register_create_operation_information(
    request: HttpRequest, payload: OperationInformationIn
) -> Tuple[Literal[201], Operation]:
    return 201, OperationService.register_operation_information(get_current_user_guid(request), None, payload)
