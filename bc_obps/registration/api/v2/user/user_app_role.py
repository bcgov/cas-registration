from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from registration.decorators import handle_http_errors
from registration.models import AppRole
from service.data_access_service.user_service import UserDataAccessService
from registration.schema.v1 import UserAppRoleOut
from registration.schema.generic import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user/user-app-role",
    response={200: UserAppRoleOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the application role of the current user.
    The endpoint uses the user's GUID to look up and return their associated application role.""",
)
@handle_http_errors()
def get_user_role(request: HttpRequest) -> Tuple[Literal[200], AppRole]:
    user_guid: UUID = get_current_user_guid(request)
    return 200, UserDataAccessService.get_app_role(user_guid)
