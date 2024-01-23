from ninja import ModelSchema
from registration.models import Address


class AddressSchema(ModelSchema):
    """
    Schema for the Address model
    """

    class Config:
        model = Address
        model_exclude = [
            "id",
        ]
