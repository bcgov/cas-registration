from common.permissions import authorize
from ninja import Status
from service.data_access_service.fuel_service import FuelTypeDataAccessService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from django.http import HttpRequest
from reporting.schema.fuel import FuelTypeSchema
from registration.schema import Message


##### GET #####


@router.get(
    "/fuel",
    response={200: FuelTypeSchema, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def get_fuel_data(
    request: HttpRequest,
    fuel_name: str,
) -> Status:
    return Status(200, FuelTypeDataAccessService.get_fuel(fuel_name))
