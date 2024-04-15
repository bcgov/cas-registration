from registration.models import BusinessStructure
from registration.schema import BusinessStructureOut
from django.core.cache import cache


class BusinessStructureDataAccessService:
    def get_business_structures():
        cached_data = cache.get("business_structures")
        if cached_data:
            return cached_data
        else:
            business_structures = BusinessStructure.objects.only(*BusinessStructureOut.Config.model_fields)
            cache.set("business_structures", business_structures, 60 * 60 * 24 * 1)  # 1 day
            return business_structures
