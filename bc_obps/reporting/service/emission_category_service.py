from reporting.models import EmissionCategory
from typing import List, Dict, Any


class EmissionCategoryService:
    @classmethod
    def get_all_emission_categories(cls) -> List[Dict[str, Any]]:
        return [dict(emission_category) for emission_category in EmissionCategory.objects.values()]
