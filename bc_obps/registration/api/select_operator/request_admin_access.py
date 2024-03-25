from service.select_operator.RequestAdminAccessService import RequestAdminAccessService
from registration.decorators import authorize
from registration.schema import (
    SelectOperatorIn,
    Message,
    RequestAccessOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.post(
    "/select-operator/request-admin-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_admin_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
def request_admin_access(request, payload: SelectOperatorIn):

    return RequestAdminAccessService.request_admin_access(request, payload)
