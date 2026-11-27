from typing import List, Literal, Tuple

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import OPERATION_TAGS
from registration.schema import Message, OperationReportableOut
from registration.service.operation_service import OperationService


@router.get(
    "/operations/reportable/previous",
    response={200: list[OperationReportableOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    auth=authorize("approved_industry_user"),
    description="""
    Returns the previous reporting year/operation combinations for which the current user is eligible to create a report
    """,
)
def list_previous_reportable_operations(
    request: HttpRequest,
) -> tuple[Literal[200], list[dict]]:
    return 200, OperationService.list_previous_reportable_operations(
        get_current_user_guid(request),
    )
