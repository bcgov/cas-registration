from ninja import ModelSchema, Field
from registration.models import Address


class AddressSchema(ModelSchema):
    """
    Schema for the Address model
    """

    class Config:
        model = Address
        address_id: int = Field(..., alias="address.id")
        model_exclude = ["id"]
