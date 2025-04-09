from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from registration.models.user import User
from registration.schema.user import ChangeUserRoleOut, UserUpdateRoleIn
from registration.schema import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.user_service import UserService


@router.patch(
    "/users/{user_id}",
    response={200: ChangeUserRoleOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Updates application role of the user and optionally archives them.
""",
    auth=authorize("cas_admin"),
)
def update_user_role(request: HttpRequest, user_id: UUID, payload: UserUpdateRoleIn) -> Tuple[Literal[200], User]:
    current_user = get_current_user_guid(request)
    updated_user = UserService.update_user_role(
        updating_user_guid=current_user, user_to_update_guid=user_id, updated_data=payload, include_archived=True
    )
    return 200, updated_user
