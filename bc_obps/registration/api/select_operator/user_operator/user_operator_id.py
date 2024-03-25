from uuid import UUID
from service.select_operator.user_operator.GetUserOperatorService import GetUserOperatorService

from registration.decorators import authorize
from registration.schema import (
    UserOperatorOut,
    Message,
)
from typing import List
from registration.api.api_base import router

from registration.models import (
    AppRole,
    UserOperator,
)
from ninja.responses import codes_4xx


@router.get(
    "/select-operator/user-operator/{uuid:user_operator_id}",
    response={200: UserOperatorOut, codes_4xx: Message},
    url_name="get_user_operator",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_user_operator(request, user_operator_id: UUID):
    return GetUserOperatorService.get_user_operator(request, user_operator_id)
