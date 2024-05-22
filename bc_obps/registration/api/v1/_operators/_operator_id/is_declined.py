from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from service.data_access_service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.utils.current_user_utils import get_current_user_guid


@router.get(
    "/operators/{operator_id}/is-declined",
    response={200: bool, custom_codes_4xx: Message},
    url_name="operator_access_declined",
    tags=OPERATOR_TAGS,
)
@authorize(['industry_user'], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_user_operator_access_declined(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[200], bool]:
    return 200, UserDataAccessService.is_users_user_operator_declined(get_current_user_guid(request), operator_id)
