from registration.models import RegulatedProduct
from registration.schema import (
    RegulatedProductSchema,
)
from django.core.cache import cache

##### GET #####


class RegulatedProductDataAccessService:
    def get_regulated_products():
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
