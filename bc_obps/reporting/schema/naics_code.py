from ninja import ModelSchema

from registration.models import NaicsCode


class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Meta:
        model = NaicsCode
        fields = ["naics_code", "naics_description"]
