from common.permissions import authorize
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import List

from reporting.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

from ..models import EmissionCategory
from ..schema.emission_category import EmissionCategorySchema
from ..service.emission_category_service import EmissionCategoryService


##### GET #####


@router.get(
    "/emission-category",
    response={200: List[EmissionCategorySchema], codes_4xx: Message, codes_5xx: Message},
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_emission_category(request: HttpRequest) -> tuple[int, list[EmissionCategory]]:
    return 200, EmissionCategoryService.get_all_emission_categories()
