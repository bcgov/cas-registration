from typing import Optional
from registration.models import RegulatedProduct
from registration.schema.v2.regulated_products import (
    RegulatedProductSchema,
)
from django.core.cache import cache
from django.db.models import QuerySet


class RegulatedProductDataAccessService:
    @classmethod
    def get_regulated_products(cls) -> QuerySet[RegulatedProduct]:
        cached_data: Optional[QuerySet[RegulatedProduct]] = cache.get("regulated_products")
        if cached_data:
            return cached_data
        else:
            regulated_products = RegulatedProduct.objects.only(*RegulatedProductSchema.Meta.fields)
            cache.set("regulated_products", regulated_products, 60 * 60 * 24 * 1)  # 1 day
            return regulated_products
