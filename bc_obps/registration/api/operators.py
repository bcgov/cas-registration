from typing import List, Literal, Optional
from registration.schema import OperatorFilterSchema, OperatorListOut, Message
from registration.models.operator import Operator
from service.operator_service import OperatorService
from common.permissions import authorize
from django.http import HttpRequest
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from ninja.pagination import paginate
from registration.utils import CustomPagination
from registration.constants import OPERATOR_TAGS
##### GET #####


@router.get(
    "/operators",
    response={200: List[OperatorListOut], custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    auth=authorize("authorized_irc_user"),
)
@paginate(CustomPagination)
def list_operators(
    request: HttpRequest,
    filters: OperatorFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operator]:
    return OperatorService.list_operators(sort_field, sort_order, filters)
