import json
from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from service.data_access_service.user_service import UserDataAccessService
from registration.decorators import handle_http_errors
from registration.models import User
from registration.schema.v1 import UserOut, UserUpdateIn
from registration.schema.generic import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


# endpoint to return user data if user exists in user table
@router.get(
    "/v2/user/user-profile",
    response={200: UserOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the profile data of the current user.
    The endpoint uses the user GUID from the authorization header to look up and return the user's profile information, including their application role.""",
)
@handle_http_errors()
def get_user_profile(request: HttpRequest) -> Tuple[Literal[200], User]:
    return 200, UserDataAccessService.get_user_profile(json.loads(request.headers.get('Authorization')).get('user_guid'))  # type: ignore[arg-type]


##### PUT #####


# Endpoint to update a user
@router.put(
    "/user/user-profile",
    response={200: UserOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Updates the profile data of the current user.
    The user's data is retrieved and updated with the new values from the payload.""",
    auth=authorize("all_roles"),
)
@handle_http_errors()
def update_user_profile(request: HttpRequest, payload: UserUpdateIn) -> Tuple[Literal[200], User]:
    return 200, UserDataAccessService.update_user(get_current_user_guid(request), payload)
