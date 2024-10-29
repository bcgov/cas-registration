from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple


from reporting.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

from ..service.gas_type_service import GasTypeService


##### GET #####


@router.get(
    "/gas-type",
    response={200: list, codes_4xx: Message, codes_5xx: Message},
    url_name="get_activities",
)
@handle_http_errors()
def get_gas_type(request: HttpRequest) -> Tuple[int, list]:
    return 200, GasTypeService.get_all_gas_types()
