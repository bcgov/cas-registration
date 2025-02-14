from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from registration.models.user import User
from registration.schema.v1.user import UserContactPageOut
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.user_service import UserService


@router.get(
    "/users/{user_id}",
    response={200: UserContactPageOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Retrieves the details of a specific user by its ID.
    We check if the user is authorized to access the user's details by comparing the business_guid of the user with the business_guid of the current user.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_user(request: HttpRequest, user_id: UUID) -> Tuple[Literal[200], User]:
    return 200, UserService.get_if_authorized(get_current_user_guid(request), user_id)
