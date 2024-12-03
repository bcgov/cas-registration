from typing import List, Literal, Optional, Tuple, Union
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import OPERATOR_TAGS
from service.operator_service import OperatorService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.decorators import handle_http_errors
from ..router import router
from registration.models import Operator
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.v1 import OperatorOut, OperatorIn, OperatorSearchOut, ConfirmSelectedOperatorOut
from registration.schema.generic import Message
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/v1/operators",
    response={200: Union[List[OperatorSearchOut], OperatorSearchOut], custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Retrieves operator(s) based on the provided CRA business number or legal name.
    This endpoint is accessible to both approved and unapproved users, allowing them to view operator information when selected.
    If no matching operator is found, an exception is raised.""",
    auth=authorize("authorized_roles"),
)
@handle_http_errors()
def v1_get_operators_by_cra_number_or_legal_name(
    request: HttpRequest, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
) -> Tuple[Literal[200], Union[Operator, QuerySet[Operator], OperatorSearchOut, List[OperatorSearchOut]]]:
    return 200, OperatorService.get_operators_by_cra_number_or_legal_name(cra_business_number, legal_name)


# We have to let unapproved users to reach this endpoint otherwise they can't see operator info when they select it
@router.get(
    "/v1/operators/{operator_id}",
    response={200: ConfirmSelectedOperatorOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Retrieves information about a specific operator by its ID.
    This endpoint is accessible to both approved and unapproved users, allowing them to view operator information when selected.""",
    auth=authorize("authorized_roles"),
)
@handle_http_errors()
def v1_get_operator(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[200], Operator]:
    return 200, OperatorDataAccessService.get_operator_by_id(operator_id)


##### PUT #####


@router.put(
    "/v1/operators/{operator_id}",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Updates the status of a specific operator by its ID.
    The endpoint allows authorized users to update the operator's status and perform additional actions based on the new status.
    If the operator is new and declined, all associated user operators are also declined, and notifications are sent accordingly.""",
    auth=authorize("authorized_irc_user"),
)
@handle_http_errors()
def v1_update_operator_status(
    request: HttpRequest, operator_id: UUID, payload: OperatorIn
) -> Tuple[Literal[200], Operator]:
    return 200, OperatorService.update_operator_status(get_current_user_guid(request), operator_id, payload)
