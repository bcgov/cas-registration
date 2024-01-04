from ninja import ModelSchema
from registration.models import RegulatedProduct


class RegulatedProductSchema(ModelSchema):
    """
    Schema for the RegulatedProduct model
    """

    class Meta:
        model = RegulatedProduct
        fields = "__all__"
