from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.schema import Message
from reporting.models import FuelType
from reporting.schema.fuel import FuelTypeSchema
from reporting.service.data_access_service.fuel_service import FuelTypeDataAccessService

from .router import router

##### GET #####


@router.get(
    "/fuel",
    response={200: FuelTypeSchema, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def get_fuel_data(
    request: HttpRequest,
    fuel_name: str,
) -> tuple[int, FuelType]:
    return 200, FuelTypeDataAccessService.get_fuel(fuel_name)
