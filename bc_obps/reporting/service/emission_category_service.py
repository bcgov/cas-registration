from reporting.models import EmissionCategory
from typing import List, Dict, Any


class EmissionCategoryService:
    @classmethod
    def get_all_emission_categories(cls) -> List[Dict[str, Any]]:
        return list(EmissionCategory.objects.all().values())
