from uuid import UUID
from service.user_operator.GetUserOperatorAdminExistsService import GetUserOperatorAdminExistsService

from registration.decorators import authorize
from registration.schema import (
    Message,
)
from registration.api.api_base import router

from registration.models import (
    AppRole,
    UserOperator,
)
from ninja.responses import codes_4xx


@router.get(
    "/operator-has-admin/{operator_id}",
    response={200: bool, codes_4xx: Message},
    url_name="get_user_operator_admin_exists",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def get_user_operator_admin_exists(request, operator_id: UUID):
    return GetUserOperatorAdminExistsService.get_user_operator_admin_exists(request, operator_id)
