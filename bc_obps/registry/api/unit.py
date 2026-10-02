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
from registry.schema.unit import UnitFilterSchema, UnitOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.unit_service import UnitService


@router.get(
    "/units",
    response={200: List[UnitOut], custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_units(
    request: HttpRequest,
    filters: UnitFilterSchema = Query(...),
    sort_field: Optional[str] = "vintage",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Unit]:
    return UnitService.list_units(sort_field, sort_order, filters)
