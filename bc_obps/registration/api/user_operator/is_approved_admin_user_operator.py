import json
from service.data_access_service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    IsApprovedUserOperator,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operator/is-approved-admin-user-operator",
    response={200: IsApprovedUserOperator, custom_codes_4xx: Message},
    url_name="is_approved_admin_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def is_approved_admin_user_operator(request):
    return 200, UserDataAccessService.is_user_an_approved_admin_user_operator(
        json.loads(request.headers.get('Authorization')).get('user_guid')
    )
