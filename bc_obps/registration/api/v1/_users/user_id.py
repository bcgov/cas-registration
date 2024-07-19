from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import USER_TAGS
from registration.decorators import authorize
from registration.models.user import User
from registration.schema.v1.user import UserContactPageOut
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message
from ninja.responses import codes_4xx
from service.user_service import UserService


@router.get(
    "/users/{uuid:user_id}",
    response={200: UserContactPageOut, codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the details of a specific user by its ID.
    We check if the user is authorized to access the user's details by comparing the business_guid of the user with the business_guid of the current user.""",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def get_user(request: HttpRequest, user_id: UUID) -> Tuple[Literal[200], User]:
    return 200, UserService.get_if_authorized(get_current_user_guid(request), user_id)
