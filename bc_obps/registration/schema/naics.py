from ninja import ModelSchema
from registration.models import NaicsCode


class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Config:
        model = NaicsCode
        model_fields = "__all__"
