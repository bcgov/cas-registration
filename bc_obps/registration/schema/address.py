from ninja import ModelSchema
from registration.models import Address


class AddressSchema(ModelSchema):
    """
    Schema for the Address model
    """

    class Config:
        model = Address
        # don't want to pull the updated_by etc. fields
        model_fields = ["street_address", "municipality", "province", "postal_code"]
