from registration.models import RegulatedProduct
from registration.schema.v1 import (
    RegulatedProductSchema,
)
from django.core.cache import cache
from typing import List

##### GET #####


class RegulatedProductDataAccessService:
    @classmethod
    def get_regulated_products(cls) -> List[RegulatedProduct]:
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
