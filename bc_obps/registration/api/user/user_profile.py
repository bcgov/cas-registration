import json
from typing import Literal, Tuple, Union
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from service.data_access_service.user_service import UserDataAccessService
from registration.models import User
from registration.schema import UserUpdateIn, UserOut, Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


# endpoint to return user data if user exists in user table
@router.get(
    "/user/user-profile",
    response={200: Union[UserOut, dict], custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the profile data of the current user.
    The endpoint uses the user GUID from the authorization header to look up and return the user's profile information, including their application role.""",
)
def get_user_profile(request: HttpRequest) -> Tuple[Literal[200], Union[User, dict]]:
    response: Union[User, dict] = {}  # to make mypy happy
    try:
        # using `get_by_guid` because we call this endpoint from the frontend middleware as part of the login flow
        response = UserDataAccessService.get_by_guid(json.loads(request.headers.get('Authorization')).get('user_guid'), include_archived=True)  # type: ignore[arg-type]
    except User.DoesNotExist:
        # if the user is not in the database, return 200 with empty dict rather than a 404 to allow frontend flow to continue smoothly
        pass
    return 200, response


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
def update_user_profile(request: HttpRequest, payload: UserUpdateIn) -> Tuple[Literal[200], User]:
    return 200, UserDataAccessService.update_user(get_current_user_guid(request), payload)
