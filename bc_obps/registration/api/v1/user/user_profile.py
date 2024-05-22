import json
from typing import Literal, Tuple
from django.http import HttpRequest
from registration.schema.v1.user import UserInWithIdp
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import USER_TAGS
from service.data_access_service.user_service import UserDataAccessService
from registration.decorators import authorize, handle_http_errors
from registration.models import AppRole, User
from registration.schema.v1 import UserOut, UserOperator, UserUpdateIn
from registration.schema.generic import Message
from registration.api.router import router
from ninja.responses import codes_4xx
from service.user_profile_service import UserProfileService

# endpoint to return user data if user exists in user table
@router.get(
    "/user/user-profile", response={200: UserOut, codes_4xx: Message}, url_name="get_user_profile", tags=USER_TAGS
)
@handle_http_errors()
def get_user_profile(request: HttpRequest) -> Tuple[Literal[200], User]:
    return 200, UserDataAccessService.get_user_profile(
        json.loads(request.headers.get('Authorization')).get('user_guid')  # type: ignore[arg-type]
    )


##### POST #####


# Endpoint to create a new user
@router.post(
    "/user/user-profile",
    response={200: UserOut, codes_4xx: Message},
    url_name="create_user_profile",
    tags=USER_TAGS,
)
@handle_http_errors()
def create_user_profile(request: HttpRequest, payload: UserInWithIdp) -> Tuple[Literal[200], User]:
    # Determine the role based on the identity provider
    return 200, UserProfileService.create_user_profile(
        json.loads(request.headers.get('Authorization')).get('user_guid'), payload.identity_provider, payload  # type: ignore[arg-type]
    )


##### PUT #####


# Endpoint to update a user
@router.put(
    "/user/user-profile", response={200: UserOut, codes_4xx: Message}, url_name="update_user_profile", tags=USER_TAGS
)
@authorize(AppRole.get_all_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def update_user_profile(request: HttpRequest, payload: UserUpdateIn) -> Tuple[Literal[200], User]:
    return 200, UserDataAccessService.update_user(get_current_user_guid(request), payload)
