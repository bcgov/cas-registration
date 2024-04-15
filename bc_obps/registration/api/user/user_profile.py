import json
from service.user_service import UserService
from registration.api.utils.current_user_utils import get_current_user_guid
from service.data_access_service.user_service import UserDataAccessService
from registration.decorators import authorize, handle_http_errors
from registration.models import AppRole
from registration.schema import UserOut, UserIn, Message, UserOperator, UserUpdateIn
from registration.api.api_base import router
from ninja.responses import codes_4xx


# endpoint to return user data if user exists in user table
@router.get("/user/user-profile", response={200: UserOut, codes_4xx: Message}, url_name="get_user_profile")
@handle_http_errors()
def get_user_profile(request):
    return UserDataAccessService.get_user_profile(get_current_user_guid(request))


##### POST #####


# Endpoint to create a new user
@router.post(
    "/user/user-profile/{identity_provider}",
    response={200: UserOut, codes_4xx: Message},
    url_name="create_user_profile",
)
@handle_http_errors()
def create_user_profile(request, identity_provider: str, payload: UserIn):
    # Determine the role based on the identity provider
    return UserService.create_user_profile(
        json.loads(request.headers.get('Authorization')).get('user_guid'), identity_provider, payload
    )


##### PUT #####


# Endpoint to update a user
@router.put("/user/user-profile", response={200: UserOut, codes_4xx: Message}, url_name="update_user_profile")
@authorize(AppRole.get_all_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def update_user_profile(request, payload: UserUpdateIn):
    return UserDataAccessService.update_user(get_current_user_guid(request), payload)
