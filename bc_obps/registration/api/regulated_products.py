from typing import Literal

from common.permissions import authorize
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import REGULATED_PRODUCT_TAGS
from registration.models import RegulatedProduct
from registration.schema import RegulatedProductSchema
from registration.service.data_access_service.regulated_product_service import (
    RegulatedProductDataAccessService,
)

##### GET #####


@router.get(
    "/regulated_products",
    response=list[RegulatedProductSchema],
    tags=REGULATED_PRODUCT_TAGS,
    description="""Retrieves a list of valid regulated products.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
    auth=authorize("authorized_roles"),
)
def list_regulated_products(
    request: HttpRequest,
) -> tuple[Literal[200], QuerySet[RegulatedProduct]]:
    return 200, RegulatedProductDataAccessService.get_valid_regulated_products()
