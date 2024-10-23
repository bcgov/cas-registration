from django.http import HttpRequest
from typing import Dict, Literal, Tuple
from registration.api.router import router
from registration.constants import USER_OPERATOR_TAGS
from service.operation_service_v2 import OperationServiceV2
from registration.api.utils.current_user_utils import get_current_user_guid
from service.data_access_service.user_service import UserDataAccessService
from common.permissions import authorize
from django.core.exceptions import ObjectDoesNotExist


@router.get(
    "/user-operators/current/has_registered_operation",
    response={200: Dict[str, bool]},
    tags=USER_OPERATOR_TAGS,
    description="""
        Checks if a current user's operator has a registered operation.
        If operator has a registered operation, it returns 'True'; otherwise, it returns 'False'.
    """,
    auth=authorize("industry_user"),
)
def get_current_user_operator_has_registered_operation(request: HttpRequest) -> Tuple[Literal[200], Dict[str, bool]]:
    # Get the current user GUID from the request
    user_guid = get_current_user_guid(request)
    try:
        # Retrieve the operator associated with the current user
        operator = UserDataAccessService.get_operator_by_user(user_guid)
        # Use the service to check if the operator has a registered operation
        has_registered_operation = OperationServiceV2.check_current_users_registered_operation(operator.id)
        return 200, {"has_registered_operation": has_registered_operation}
    except ObjectDoesNotExist:
        # Handle the case where no user_operator is found for the user
        return 200, {"has_registered_operation": False}
