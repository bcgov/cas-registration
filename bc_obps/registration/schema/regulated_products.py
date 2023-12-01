from ninja import ModelSchema
from registration.models import RegulatedProduct


class RegulatedProductSchema(ModelSchema):
    """
    Schema for the RegulatedProduct model
    """

    class Config:
        model = RegulatedProduct
        model_fields = "__all__"
