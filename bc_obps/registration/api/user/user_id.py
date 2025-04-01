from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_TAGS
from registration.models.user import User
from registration.schema.user import ChangeUserRoleOut, UserUpdateRoleIn
from service.data_access_service.user_service import UserDataAccessService
from registration.schema import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from django.utils import timezone


@router.patch(
    "/users/{user_id}",
    response={200: ChangeUserRoleOut, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Updates application role of the user and optionally archives them.
""",
    auth=authorize("authorized_irc_user"),
)
def update_user_role(request: HttpRequest, user_id: UUID, payload: UserUpdateRoleIn) -> Tuple[Literal[200], User]:
    user = UserDataAccessService.update_user(user_guid=user_id, updated_data=payload, include_archived=True)
    if payload.archive:
        # brianna this isn't working
        # user.set_archive(get_current_user_guid(request))
        user.archived_at = timezone.now()
        user.archived_by_id = get_current_user_guid(request)
    else:
        user.archived_at = None
        user.archived_by = None
    user.save()
    return 200, user
