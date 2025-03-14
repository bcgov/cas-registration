from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from uuid import UUID
from registration.constants import USER_OPERATOR_TAGS
from common.api.utils import get_current_user_guid
from registration.schema import UserOperatorStatusUpdate, UserOperatorStatusUpdateOut, Message
from registration.models import UserOperator
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router
from service.user_operator_service import UserOperatorService


@router.patch(
    "/user-operators/{user_operator_id}/status",
    response={200: UserOperatorStatusUpdateOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Updates the status of a user operator by its ID.
    If the status is updated to 'APPROVED' or 'DECLINED', the user operator is verified with the current timestamp and the admin who performed the action.
    An email notification is sent based on the updated status.""",
    auth=authorize("cas_director_analyst_and_industry_admin_user"),
)
def update_user_operator_status(
    request: HttpRequest, user_operator_id: UUID, payload: UserOperatorStatusUpdate
) -> Tuple[Literal[200], UserOperator]:
    return 200, UserOperatorService.update_status_and_create_contact(
        user_operator_id, payload, get_current_user_guid(request)
    )
