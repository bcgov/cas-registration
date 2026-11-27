import json
from typing import Literal, Union

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import USER_TAGS
from registration.models import User
from registration.schema import Message, UserLoginSyncIn, UserOut, UserUpdateIn
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.data_types.user_profile_service import UserLoginSyncData
from registration.service.user_profile_service import UserProfileService


# endpoint to return user data if user exists in user table
@router.get(
    "/user/user-profile",
    response={200: UserOut | dict, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the profile data of the current user.
    The endpoint uses the user GUID from the authorization header to look up and return the user's profile information, including their application role.""",
)
def get_user_profile(request: HttpRequest) -> tuple[Literal[200], User | dict]:
    response: User | dict = {}  # to make mypy happy
    try:
        # using `get_by_guid` because we call this endpoint from the frontend middleware as part of the login flow
        response = UserDataAccessService.get_by_guid(
            json.loads(request.headers.get("Authorization")).get("user_guid"),  # type: ignore[arg-type]
            include_archived=True,
        )
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
def update_user_profile(
    request: HttpRequest, payload: UserUpdateIn
) -> tuple[Literal[200], User]:
    return 200, UserDataAccessService.update_user(
        get_current_user_guid(request), payload
    )


@router.put(
    "/user/user-profile/login-sync",
    response={200: UserOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Refreshes the current industry user's email and BCeID business name with the values from their identity provider (BCeID) profile.""",
    auth=authorize("industry_user"),
)
def sync_user_profile_on_login(
    request: HttpRequest, payload: UserLoginSyncIn
) -> tuple[Literal[200], User]:
    return 200, UserProfileService.sync_user_profile_from_idp(
        get_current_user_guid(request), UserLoginSyncData(**payload.model_dump())
    )
