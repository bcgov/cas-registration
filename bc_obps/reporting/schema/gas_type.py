from ninja import ModelSchema
from reporting.models import GasType


class GasTypeSchema(ModelSchema):
    """
    Schema for the FuelType model
    """

    class Meta:
        model = GasType
        fields = ["id", "name", "chemical_formula", "cas_number"]
