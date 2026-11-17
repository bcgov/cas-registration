from typing import Optional
from uuid import uuid4
from registration.models import RegulatedProduct
from registration.models.regulated_product import REGULATED_PRODUCTS_CACHE_VERSION_KEY
from registration.schema import RegulatedProductSchema
from django.core.cache import cache
from django.db.models import QuerySet
from datetime import date


class RegulatedProductDataAccessService:
    @classmethod
    def get_valid_regulated_products(cls, request_date: Optional[date] = None) -> QuerySet[RegulatedProduct]:
        if request_date is None:
            request_date = date.today()
        # The result depends on the date, so it must be part of the key.
        # The version token lets RegulatedProduct.save() invalidate every date at once.
        version = cache.get_or_set(REGULATED_PRODUCTS_CACHE_VERSION_KEY, uuid4().hex, None)
        cache_key = f"regulated_products-{version}-{request_date.isoformat()}"
        cached_data: Optional[QuerySet[RegulatedProduct]] = cache.get(cache_key)
        if cached_data is not None:
            return cached_data
        regulated_products = RegulatedProduct.objects.filter(
            valid_from__lte=request_date, valid_to__gte=request_date
        ).only(*RegulatedProductSchema.Meta.fields)
        cache.set(cache_key, regulated_products, 60 * 60 * 24 * 1)  # 1 day
        return regulated_products
