from service.product_service import ProductService
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple
from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx


##### GET #####


@router.get(
    "/products",
    response={200: list, codes_4xx: Message, codes_5xx: Message},
    url_name="get_products",
)
@handle_http_errors()
def get_products(request: HttpRequest) -> Tuple[int, list]:
    print("fetching ")
    return 200, ProductService.get_all_regulated_products()
