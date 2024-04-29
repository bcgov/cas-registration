import json
from registration.decorators import handle_http_errors
from service.data_access_service.user_service import UserDataAccessService
from registration.schema import UserAppRoleOut, Message
from registration.api.api_base import router
from ninja.responses import codes_4xx


@router.get("user/user-app-role", response={200: UserAppRoleOut, codes_4xx: Message}, url_name="get_user_role")
@handle_http_errors()
def get_user_role(request):
    return 200, UserDataAccessService.get_app_role(json.loads(request.headers.get('Authorization')).get('user_guid'))
