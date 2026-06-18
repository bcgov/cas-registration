from typing import List, Literal, Tuple
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.schema import OperationReportableOut, Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.operation_service import OperationService
from registration.api.router import router
from common.permissions import authorize
from registration.constants import OPERATION_TAGS

##### GET #####


@router.get(
    "/operations/reportable/previous",
    response={200: List[OperationReportableOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    auth=authorize("approved_industry_user"),
    description="""
    Returns the previous reporting year/operation combinations for which the current user is eligible to create a report
    """,
)
def list_previous_reportable_operations(
    request: HttpRequest,
) -> Tuple[Literal[200], list[dict]]:
    return 200, OperationService.list_previous_reportable_operations(
        get_current_user_guid(request),
    )
