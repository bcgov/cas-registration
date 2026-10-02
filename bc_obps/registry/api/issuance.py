from typing import List, Literal, Optional

from common.permissions import authorize
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate

from registration.schema import Message
from registration.utils import CustomPagination
from registry.api.router import router
from registry.models import Unit
from registry.schema.issuance import IssuanceFilterSchema, IssuanceOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.issuance_service import IssuanceService


@router.get(
	"/issuances",
	response={200: List[IssuanceOut], custom_codes_4xx: Message},
	auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_issuances(
    request: HttpRequest,
    filters: IssuanceFilterSchema = Query(...),
    sort_field: Optional[str] = "request_date",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
) -> QuerySet[Unit]:
    return IssuanceService.list_issuances(sort_field, sort_order, filters)
