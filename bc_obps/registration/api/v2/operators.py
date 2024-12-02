from typing import List, Literal, Optional
from registration.schema.v2.operator import OperatorFilterSchema, OperatorListOut
from registration.models.operator import Operator
from service.operator_service_v2 import OperatorServiceV2
from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from ninja.pagination import paginate
from registration.utils import CustomPagination
from typing import Tuple
from uuid import UUID
from common.api.utils import get_current_user_guid
from registration.constants import OPERATOR_TAGS
from service.operator_service import OperatorService
from registration.schema.v1 import OperatorOut, OperatorIn

##### GET #####


@router.get(
    "/operators",
    response={200: List[OperatorListOut], custom_codes_4xx: Message},
    tags=["V2"],
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
@paginate(CustomPagination)
def list_operators(
    request: HttpRequest,
    filters: OperatorFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operator]:
    return OperatorServiceV2.list_operators(sort_field, sort_order, filters)


@router.put(
    "/operators/{uuid:operator_id}",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Updates the status of a specific operator by its ID.
    The endpoint allows authorized users to update the operator's status and perform additional actions based on the new status.
    If the operator is new and declined, all associated user operators are also declined, and notifications are sent accordingly.""",
    auth=authorize("v1_authorized_irc_user"),
)
@handle_http_errors()
def update_operator_status(
    request: HttpRequest, operator_id: UUID, payload: OperatorIn
) -> Tuple[Literal[200], Operator]:
    return 200, OperatorService.update_operator_status(get_current_user_guid(request), operator_id, payload)
