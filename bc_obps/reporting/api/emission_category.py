from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple


from reporting.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx
from ..service.emission_category_service import EmissionCategoryService


##### GET #####


@router.get(
    "/emission-category",
    response={200: list, codes_4xx: Message, codes_5xx: Message},
    url_name="get_activities",
)
@handle_http_errors()
def get_emission_category(request: HttpRequest) -> Tuple[int, list]:
    return 200, EmissionCategoryService.get_all_emission_categories()
