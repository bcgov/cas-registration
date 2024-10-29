from reporting.models import GasType
from typing import List, Dict, Any


class GasTypeService:
    @classmethod
    def get_all_gas_types(cls) -> List[Dict[str, Any]]:
        # Fetch gas types as dictionaries
        return list(GasType.objects.all().values())
