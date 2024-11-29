from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router
from registration.models import UserOperator
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/v1/operators/{operator_id}/has-admin",
    response={200: bool, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Checks if a specific operator has any approved admin users. The endpoint verifies whether there are any users with the 'ADMIN' role and 'APPROVED' status for the given operator ID.
    If such admin users exist, it returns 'True'; otherwise, it returns 'False'.""",
    auth=authorize("authorized_roles"),
)
@handle_http_errors()
def v1_get_user_operator_has_admin(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[200], bool]:
    return 200, UserOperatorDataAccessService.get_admin_users(operator_id, UserOperator.Statuses.APPROVED).exists()
