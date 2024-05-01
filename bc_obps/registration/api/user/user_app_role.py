from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from service.data_access_service.user_service import UserDataAccessService
from registration.schema import UserAppRoleOut, Message
from registration.api.api_base import router
from ninja.responses import codes_4xx


@router.get("user/user-app-role", response={200: UserAppRoleOut, codes_4xx: Message}, url_name="get_user_role")
@handle_http_errors()
def get_user_role(request):
    user_guid = get_current_user_guid(request)
    return 200, UserDataAccessService.get_app_role(user_guid)
