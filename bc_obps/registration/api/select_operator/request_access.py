from registration.service.select_operator.RequestAccessService import RequestAccessService
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
    "/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message}, url_name="request_access"
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@try_except_wrapper()
def request_access(request, payload: SelectOperatorIn):

    return RequestAccessService.request_access(request, payload)
