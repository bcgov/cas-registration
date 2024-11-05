from service.data_access_service.fuel_service import FuelTypeDataAccessService
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple
from reporting.models import FuelType
from reporting.schema.fuel import FuelTypeSchema

from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx


##### GET #####


@router.get(
    "/fuel",
    response={200: FuelTypeSchema, codes_4xx: Message, codes_5xx: Message},
)
@handle_http_errors()
def get_fuel_data(
    request: HttpRequest,
    fuel_name: str,
) -> Tuple[int, FuelType]:
    return 200, FuelTypeDataAccessService.get_fuel(fuel_name)
