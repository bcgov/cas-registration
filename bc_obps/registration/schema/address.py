from ninja import ModelSchema, Field
from registration.models import Address


class AddressSchema(ModelSchema):
    """
    Schema for the Address model
    """

    class Meta:
        model = Address
        address_id: int = Field(..., alias="id")
        exclude = ["id"]
