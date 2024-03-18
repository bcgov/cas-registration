from uuid import UUID
from registration.service.user_operator.GetUserOperatorAccessDeclinedService import GetUserOperatorAccessDeclinedService

from registration.decorators import authorize, try_except_wrapper
from registration.schema import (
    Message,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from ninja.responses import codes_4xx


@router.get(
    "/operator-access-declined/{operator_id}",
    response={200: bool, codes_4xx: Message},
    url_name="operator_access_declined",
)
@authorize(['industry_user'], UserOperator.get_all_industry_user_operator_roles(), False)
@try_except_wrapper()
def get_user_operator_access_declined(request, operator_id: UUID):
    return GetUserOperatorAccessDeclinedService.get_user_operator_access_declined(request, operator_id)
