from typing import Literal, Tuple, List
from uuid import UUID
from django.db.models import QuerySet
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS_V2
from registration.schema.v2.operation_designated_operator import OperationDesignatedOperatorTimelineOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.models import OperationDesignatedOperatorTimeline
from registration.schema.generic import Message
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService


##### GET #####
@router.get(
    "/operators/{uuid:operator_id}/operations",
    response={200: List[OperationDesignatedOperatorTimelineOut], custom_codes_4xx: Message},
    tags=OPERATOR_TAGS_V2,
    description="""Retrieves a list of operations associated with the specified operator.
    This endpoint is not paginated because it is being used for a dropdown list in the UI.""",
    auth=authorize("cas_analyst"),
)
@handle_http_errors()
def list_operations_by_operator_id(
    request: HttpRequest, operator_id: UUID
) -> Tuple[Literal[200], QuerySet[OperationDesignatedOperatorTimeline]]:
    return 200, OperationDesignatedOperatorTimelineService.list_timeline_by_operator_id(operator_id)
