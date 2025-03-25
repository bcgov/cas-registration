from django.http import HttpRequest
from typing import Dict, Literal, Tuple
from registration.api.router import router
from registration.constants import USER_OPERATOR_TAGS
from service.data_access_service.operation_service import OperationDataAccessService
from common.api.utils import get_current_user_guid
from service.data_access_service.user_service import UserDataAccessService
from common.permissions import authorize
from django.core.exceptions import ObjectDoesNotExist
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema import Message


@router.get(
    "/user-operators/current/has_registered_operation",
    response={200: Dict[str, bool], custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""
        Checks if a current user's operator has a registered operation.
        If operator has a registered operation, it returns 'True'; otherwise, it returns 'False'.
    """,
    auth=authorize("industry_user"),
)
def get_current_user_operator_has_registered_operation(request: HttpRequest) -> Tuple[Literal[200], Dict[str, bool]]:
    try:
        current_user_guid = get_current_user_guid(request)
        # Retrieve the operator associated with the current user
        operator = UserDataAccessService.get_operator_by_user(current_user_guid)
        # Check if user has access to the operator(We use this endpoint for dashboard tiles too)
        # If user does not have access to the operator, we don't need to check for registered operation
        if not operator.user_has_access(current_user_guid):
            return 200, {"has_registered_operation": False}
        # Use the service to check if the operator has a registered operation
        has_registered_operation = OperationDataAccessService.check_current_users_registered_operation(operator.id)
        return 200, {"has_registered_operation": has_registered_operation}
    except ObjectDoesNotExist:
        # Handle the case where no user_operator is found for the user
        return 200, {"has_registered_operation": False}
