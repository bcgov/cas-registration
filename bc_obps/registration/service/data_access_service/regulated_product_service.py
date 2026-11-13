from typing import Optional
from registration.models import RegulatedProduct
from registration.schema import RegulatedProductSchema
from django.core.cache import cache
from django.db.models import QuerySet
from datetime import date


class RegulatedProductDataAccessService:
    @classmethod
    def get_valid_regulated_products(cls, request_date: date = date.today()) -> QuerySet[RegulatedProduct]:
        cached_data: Optional[QuerySet[RegulatedProduct]] = cache.get("regulated_products")
        if cached_data:
            return cached_data
        else:
            regulated_products = RegulatedProduct.objects.filter(
                valid_from__lte=request_date, valid_to__gte=request_date
            ).only(*RegulatedProductSchema.Meta.fields)
            cache.set("regulated_products", regulated_products, 60 * 60 * 24 * 1)  # 1 day
            return regulated_products
