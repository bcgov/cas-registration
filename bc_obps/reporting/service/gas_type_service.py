from reporting.models import GasType
from typing import List


class GasTypeService:
    @classmethod
    def get_all_gas_types(cls) -> List[GasType]:
        return list(GasType.objects.all())

    @classmethod
    def get_basic_gas_types(cls) -> List[GasType]:
        return list(GasType.objects.filter(chemical_formula__in=['CO2', 'CH4', 'N2O', 'SF6', 'CF4', 'C2F6']))
