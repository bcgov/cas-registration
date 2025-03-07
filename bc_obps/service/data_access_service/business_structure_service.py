from typing import Optional
from registration.models import BusinessStructure
from registration.schema import BusinessStructureOut
from django.core.cache import cache
from django.db.models import QuerySet


class BusinessStructureDataAccessService:
    @classmethod
    def get_business_structures(cls) -> QuerySet[BusinessStructure]:
        cached_data: Optional[QuerySet[BusinessStructure]] = cache.get("business_structures")
        if cached_data:
            return cached_data
        else:
            business_structures = BusinessStructure.objects.only(*BusinessStructureOut.Meta.fields)
            cache.set("business_structures", business_structures, 60 * 60 * 24 * 1)  # 1 day
            return business_structures
