from service.current_user_service import CurrentUserService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    IsApprovedUserOperator,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/is-approved-admin-user-operator/{user_guid}",
    response={200: IsApprovedUserOperator, custom_codes_4xx: Message},
    url_name="is_approved_admin_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def is_approved_admin_user_operator(request):

# CurrentUserService.get_user_guid(request)--this is a uitlity api funciton and should be api helper, not in any service layer

    return CurrentUserService.is_user_an_approved_admin_user_operator(CurrentUserService.get_user_guid(request))
