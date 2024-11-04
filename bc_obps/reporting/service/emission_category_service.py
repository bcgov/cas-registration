from reporting.models import EmissionCategory
from typing import List


class EmissionCategoryService:
    @classmethod
    def get_all_emission_categories(cls) -> List[EmissionCategory]:
        return list(EmissionCategory.objects.all())
