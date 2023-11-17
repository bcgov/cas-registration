from ninja import ModelSchema
from registration.models import NaicsCode, NaicsCategory


class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Config:
        model = NaicsCode
        model_fields = "__all__"


class NaicsCategorySchema(ModelSchema):
    """
    Schema for the NaicsCategory model
    """

    class Config:
        model = NaicsCategory
        model_fields = "__all__"
