from registration.service.select_operator.RequestAdminAccessService import RequestAdminAccessService
from registration.decorators import authorize, try_except_wrapper
from registration.schema import (
    SelectOperatorIn,
    Message,
    RequestAccessOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from ninja.responses import codes_4xx


@router.post(
    "/select-operator/request-admin-access",
    response={201: RequestAccessOut, codes_4xx: Message},
    url_name="request_admin_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@try_except_wrapper()
def request_admin_access(request, payload: SelectOperatorIn):

    return RequestAdminAccessService.request_admin_access(request, payload)
