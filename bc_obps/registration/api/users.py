import json
from typing import Literal, Tuple
from django.http import HttpRequest
from registration.schema import UserIn, UserOut, Message
from registration.constants import USER_TAGS
from registration.models import User
from registration.api.router import router
from registration.schema.user import InternalUserListOut
from service.data_access_service.user_service import UserDataAccessService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.user_profile_service import UserProfileService
from common.permissions import authorize
from django.db.models import QuerySet
from typing import List

##### GET #####


# Endpoint to retrieve internal users
@router.get(
    "/users",
    response={200: List[InternalUserListOut], custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the list of internal users""",
    auth=authorize("authorized_irc_user"),
)
def get_internal_users(request: HttpRequest) -> Tuple[Literal[200], QuerySet[User]]:
    return 200, UserDataAccessService.get_internal_users_including_archived()


##### POST #####


# Endpoint to create a new user
@router.post(
    "/users",
    response={201: UserOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Creates a new user.
    The endpoint determines the user's role based on the identity provider specified in the payload and assigns the appropriate application role.
    The user's GUID is obtained from the authorization header.""",
)
def create_user_profile(request: HttpRequest, payload: UserIn) -> Tuple[Literal[201], User]:
    # Determine the role based on the identity provider
    return 201, UserProfileService.create_user_profile(json.loads(request.headers.get('Authorization')).get('user_guid'), payload)  # type: ignore[arg-type]
