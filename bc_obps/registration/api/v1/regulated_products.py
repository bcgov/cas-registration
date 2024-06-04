from django.http import HttpRequest
from registration.constants import REGULATED_PRODUCT_TAGS
from service.data_access_service.regulated_product_service import RegulatedProductDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import AppRole, RegulatedProduct, UserOperator
from registration.schema.v1 import RegulatedProductSchema
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/regulated_products",
    response=List[RegulatedProductSchema],
    tags=REGULATED_PRODUCT_TAGS,
    description="""Retrieves a list of regulated products.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_regulated_products(request: HttpRequest) -> Tuple[Literal[200], QuerySet[RegulatedProduct]]:
    return 200, RegulatedProductDataAccessService.get_regulated_products()
