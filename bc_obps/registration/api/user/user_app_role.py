from registration.decorators import handle_http_errors
from service.data_access_service.user_service import UserDataAccessService
from registration.models import User
from registration.schema import UserAppRoleOut, Message
from registration.api.api_base import router
from ninja.responses import codes_4xx

# endpoint to return user's role_name if user exists in user table
@router.get(
    "user/user-app-role/{user_guid}", response={200: UserAppRoleOut, codes_4xx: Message}, url_name="get_user_role"
)
@handle_http_errors()
def get_user_role(request, user_guid: str):
    return UserDataAccessService.get_user_app_role(user_guid)
