from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import USER_OPERATOR_TAGS
from registration.schema import Message
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.operator_service import OperatorService


@router.get(
    "/user-operators/current/has-required-fields",
    response={200: dict[str, bool], custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""
        Checks if a current user's operator has all required fields completed.
        If all required fields (as defined by the hard-coded array) are completed, it returns 'True'; otherwise, it returns 'False'.
    """,
    auth=authorize("industry_user"),
)
def get_current_user_operator_has_required_fields(
    request: HttpRequest,
) -> tuple[Literal[200], dict[str, bool]]:
    try:
        # Retrieve the operator associated with the current user
        operator = UserDataAccessService.get_operator_by_user(
            get_current_user_guid(request)
        )
        # Use the service to check if the operator has all required fields filled
        has_required_fields = OperatorService.has_required_fields(operator)
        return 200, {"has_required_fields": has_required_fields}
    except ObjectDoesNotExist:
        # Handle the case where no user_operator is found for the user
        return 200, {"has_required_fields": False}
