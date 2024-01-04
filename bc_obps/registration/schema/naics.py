from ninja import ModelSchema
from registration.models import NaicsCode


class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Meta:
        model = NaicsCode
        fields = "__all__"
