from common.permissions import authorize
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import List

from reporting.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

from ..models import GasType
from ..schema.gas_type import GasTypeSchema
from ..service.gas_type_service import GasTypeService


##### GET #####


@router.get(
    "/gas-type",
    response={200: List[GasTypeSchema], codes_4xx: Message, codes_5xx: Message},
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_gas_type(request: HttpRequest) -> tuple[int, list[GasType]]:
    return 200, GasTypeService.get_all_gas_types()
