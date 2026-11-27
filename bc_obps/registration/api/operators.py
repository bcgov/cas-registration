from typing import Literal

from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate
from registration.api.router import router
from registration.constants import OPERATOR_TAGS
from registration.models.operator import Operator
from registration.schema import Message, OperatorFilterSchema, OperatorListOut
from registration.service.operator_service import OperatorService
from registration.utils import CustomPagination

##### GET #####


@router.get(
    "/operators",
    response={200: list[OperatorListOut], custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    auth=authorize("authorized_irc_user"),
)
@paginate(CustomPagination)
def list_operators(
    request: HttpRequest,
    filters: OperatorFilterSchema = Query(...),
    sort_field: str | None = "created_at",
    sort_order: Literal["desc", "asc"] | None = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operator]:
    return OperatorService.list_operators(sort_field, sort_order, filters)
