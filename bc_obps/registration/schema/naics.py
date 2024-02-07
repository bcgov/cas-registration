from ninja import ModelSchema
from registration.models import NaicsCode


class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Config:
        model = NaicsCode
        model_fields = ["id", "naics_code", "naics_description"]
