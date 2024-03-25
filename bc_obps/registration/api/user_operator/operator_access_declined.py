from uuid import UUID
from service.user_operator.get_user_operator_access_declined_service import GetUserOperatorAccessDeclinedService

from registration.decorators import authorize
from registration.schema import (
    Message,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/operator-access-declined/{operator_id}",
    response={200: bool, custom_codes_4xx: Message},
    url_name="operator_access_declined",
)
@authorize(['industry_user'], UserOperator.get_all_industry_user_operator_roles(), False)
def get_user_operator_access_declined(request, operator_id: UUID):
    return GetUserOperatorAccessDeclinedService.get_user_operator_access_declined(request, operator_id)
