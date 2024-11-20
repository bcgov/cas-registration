from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import List
from reporting.schema.generic import Message
from ..models import GasType
from ..schema.gas_type import GasTypeSchema
from ..service.gas_type_service import GasTypeService


##### GET #####


@router.get(
    "/gas-type",
    response={200: List[GasTypeSchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_gas_type(request: HttpRequest) -> tuple[int, list[GasType]]:
    return 200, GasTypeService.get_all_gas_types()
