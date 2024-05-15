from typing import List, Literal, Optional, Tuple, Union
from uuid import UUID
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import OPERATOR_TAGS
from service.operator_service import OperatorService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.decorators import authorize, handle_http_errors
from ..router import router
from registration.models import AppRole, Operator, UserOperator
from ninja.responses import codes_4xx, codes_5xx
from registration.schema.v1 import OperatorOut, OperatorIn, OperatorSearchOut, ConfirmSelectedOperatorOut
from registration.schema.generic import Message
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/operators",
    response={200: Union[List[OperatorSearchOut], OperatorSearchOut], codes_4xx: Message, codes_5xx: Message},
    url_name="get_operators_by_cra_number_or_legal_name",
    tags=OPERATOR_TAGS,
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_operators_by_cra_number_or_legal_name(
    request: HttpRequest, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
) -> tuple[Literal[200], Union[Operator, QuerySet[Operator]]]:
    return 200, OperatorService.get_operators_by_cra_number_or_legal_name(cra_business_number, legal_name)


# We have to let unapproved users to reach this endpoint otherwise they can't see operator info when they select it
@router.get(
    "/operators/{operator_id}",
    response={200: ConfirmSelectedOperatorOut, codes_4xx: Message},
    url_name="get_operator",
    tags=OPERATOR_TAGS,
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_operator(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[200], Operator]:
    return 200, OperatorDataAccessService.get_operator_by_id(operator_id)


##### POST #####


##### PUT #####


@router.put(
    "/operators/{operator_id}",
    response={200: OperatorOut, codes_4xx: Message},
    url_name="update_operator_status",
    tags=OPERATOR_TAGS,
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def update_operator_status(
    request: HttpRequest, operator_id: UUID, payload: OperatorIn
) -> Tuple[Literal[200], Operator]:
    return 200, OperatorService.update_operator_status(get_current_user_guid(request), operator_id, payload)


##### DELETE #####
