import json

from django.shortcuts import get_object_or_404
from service.user_profile_service import UserService
from registration.api.utils.current_user_utils import get_current_user_guid
from service.data_access_service.user_service import UserDataAccessService
from registration.decorators import authorize, handle_http_errors
from registration.models import AppRole, User
from registration.schema import UserOut, UserIn, Message, UserOperator, UserUpdateIn
from registration.api.api_base import router
from ninja.responses import codes_4xx


# endpoint to return user data if user exists in user table
@router.get("/user/user-profile", response={200: UserOut, codes_4xx: Message}, url_name="get_user_profile")
@handle_http_errors()
def get_user_profile(request):
    # brianna here?
    # return UserDataAccessService.get_user_profile(json.loads(request.headers.get('Authorization')).get('user_guid'))
    user = get_object_or_404(User, user_guid=json.loads(request.headers.get('Authorization')).get('user_guid'))
    try:
        user_guid = json.loads(request.headers.get('Authorization')).get('user_guid')
        user = (
            User.objects.only(*UserOut.Config.model_fields, "app_role")
            .select_related('app_role')
            .get(user_guid=user_guid)
        )
    except User.DoesNotExist:
        return 404, {"message": "No matching user found"}
    return 200, user


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
