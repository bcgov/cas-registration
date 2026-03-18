from typing import Optional
from django.conf import settings
from registration.models import RegulatedProduct
from registration.schema import RegulatedProductSchema
from django.core.cache import cache
from django.db.models import QuerySet


class RegulatedProductDataAccessService:
    @classmethod
    def get_regulated_products(cls) -> QuerySet[RegulatedProduct]:
        cached_data: Optional[QuerySet[RegulatedProduct]] = cache.get("regulated_products")
        if cached_data:
            return cached_data
        else:
            if settings.RESTRICTED_NAICS_CODES_FOR_REPORTING:
                regulated_products = RegulatedProduct.objects.exclude(
                    name="Pulp and paper: lime recovered by kiln"
                ).only(*RegulatedProductSchema.Meta.fields)
            else:
                regulated_products = RegulatedProduct.objects.only(*RegulatedProductSchema.Meta.fields)
            cache.set("regulated_products", regulated_products, 60 * 60 * 24 * 1)  # 1 day
            return regulated_products
