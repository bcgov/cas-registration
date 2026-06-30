from common.permissions import authorize
from ninja import Status
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from django.http import HttpRequest
from typing import List
from reporting.schema.generic import Message
from ..schema.gas_type import GasTypeSchema
from ..service.gas_type_service import GasTypeService


##### GET #####


@router.get(
    "/gas-type",
    response={200: List[GasTypeSchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
def get_gas_type(request: HttpRequest) -> Status:
    return Status(200, GasTypeService.get_all_gas_types())


@router.get(
    "/basic-gas-types",
    response={200: List[GasTypeSchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
def get_basic_gas_types(request: HttpRequest) -> Status:
    return Status(200, GasTypeService.get_basic_gas_types())
