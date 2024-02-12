from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import AppRole, RegulatedProduct, UserOperator
from registration.schema import (
    RegulatedProductSchema,
)
from django.core.cache import cache

##### GET #####


@router.get("/regulated_products", response=List[RegulatedProductSchema])
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_regulated_products(request):
    cached_data = cache.get("regulated_products")
    if cached_data:
        return cached_data
    else:
        regulated_products = RegulatedProduct.objects.only(*RegulatedProductSchema.Config.model_fields)
        cache.set("regulated_products", regulated_products, 60 * 60 * 24 * 1)  # 1 day
        return regulated_products


##### POST #####


##### PUT #####


##### DELETE #####
