from reporting.models import GasType
from typing import List, Dict, Any


class GasTypeService:
    @classmethod
    def get_all_gas_types(cls) -> List[Dict[str, Any]]:
        return [dict(gas_type) for gas_type in GasType.objects.values()]
