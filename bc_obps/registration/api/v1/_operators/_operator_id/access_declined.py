from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from service.data_access_service.user_service import UserDataAccessService
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from common.api.utils import get_current_user_guid


@router.get(
    "/v1/operators/{operator_id}/access-declined",
    response={200: bool, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Checks if the current user's access to a specific operator has been declined.
    The endpoint verifies whether the user has a 'DECLINED' status for the given operator ID.
    If the user’s access is declined, it returns 'True'; otherwise, it returns 'False'.""",
    auth=authorize("industry_user"),
)
@handle_http_errors()
def v1_get_user_operator_access_declined(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[200], bool]:
    return 200, UserDataAccessService.is_users_user_operator_declined(get_current_user_guid(request), operator_id)
