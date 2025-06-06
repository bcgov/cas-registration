from typing import Literal, Tuple, Union
from uuid import UUID
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from registration.models import AppRole
from service.data_access_service.user_service import UserDataAccessService
from registration.schema import UserAppRoleOut, Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.types import DictStrAny


@router.get(
    "/user/user-app-role",
    response={200: UserAppRoleOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the application role of the current user.
    The endpoint uses the user's GUID to look up and return their associated application role.""",
)
def get_user_role(request: HttpRequest) -> Tuple[Literal[200], Union[AppRole, DictStrAny]]:
    """
    Retrieves the application role of the current user by looking up their GUID.
    Returns the user's app role if the user exists in our database,
    otherwise returns a dictionary with role_name set to None.
    This approach avoids errors for new or unknown users and delegates handling to the frontend.
    """
    if getattr(request, "current_user") is not None:
        user_guid: UUID = get_current_user_guid(request)
        return 200, UserDataAccessService.get_app_role(user_guid)
    return 200, {"role_name": None}
