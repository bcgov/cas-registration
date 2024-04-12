from registration.models import User
from registration.schema import UserAppRoleOut, Message
from registration.api.api_base import router
from ninja.responses import codes_4xx

# endpoint to return user's role_name if user exists in user table
@router.get(
    "user/user-app-role/{user_guid}", response={200: UserAppRoleOut, codes_4xx: Message}, url_name="get_user_role"
)
def get_user_role(request, user_guid: str):
    try:
        user = User.objects.only('app_role').select_related('app_role').get(user_guid=user_guid)
    except User.DoesNotExist:
        return 404, {"message": "No matching user found"}
    return 200, user.app_role
