from service.data_access_service.fuel_service import FuelTypeDataAccessService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from django.http import HttpRequest
from typing import Tuple
from reporting.models import FuelType
from reporting.schema.fuel import FuelTypeSchema
from registration.schema.generic import Message


##### GET #####


@router.get(
    "/fuel",
    response={200: FuelTypeSchema, custom_codes_4xx: Message},
)
def get_fuel_data(
    request: HttpRequest,
    fuel_name: str,
) -> Tuple[int, FuelType]:
    return 200, FuelTypeDataAccessService.get_fuel(fuel_name)
