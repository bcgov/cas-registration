from reporting.models import GasType
from typing import List


class GasTypeService:
    @classmethod
    def get_all_gas_types(cls) -> List[GasType]:
        return list(GasType.objects.all())
