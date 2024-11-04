from ninja import ModelSchema
from reporting.models import EmissionCategory


class EmissionCategorySchema(ModelSchema):
    """
    Schema for the Emission Category model
    """

    class Meta:
        model = EmissionCategory
        fields = ["id", "category_name", "category_type"]
