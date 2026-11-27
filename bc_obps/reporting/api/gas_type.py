from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.schema.generic import Message

from ..models import GasType
from ..schema.gas_type import GasTypeSchema
from ..service.gas_type_service import GasTypeService
from .router import router

##### GET #####


@router.get(
    "/gas-type",
    response={200: list[GasTypeSchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
def get_gas_type(request: HttpRequest) -> tuple[int, list[GasType]]:
    return 200, GasTypeService.get_all_gas_types()


@router.get(
    "/basic-gas-types",
    response={200: list[GasTypeSchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
def get_basic_gas_types(request: HttpRequest) -> tuple[int, list[GasType]]:
    return 200, GasTypeService.get_basic_gas_types()
