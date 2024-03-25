from service.select_operator.RequestAccessService import RequestAccessService
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
    "/select-operator/request-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
def request_access(request, payload: SelectOperatorIn):

    return RequestAccessService.request_access(request, payload)
