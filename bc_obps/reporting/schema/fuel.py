from ninja import ModelSchema
from reporting.models import FuelType


class FuelTypeSchema(ModelSchema):
    """
    Schema for the FuelType model
    """

    class Meta:
        model = FuelType
        fields = ["id", "name", "classification", "unit"]
