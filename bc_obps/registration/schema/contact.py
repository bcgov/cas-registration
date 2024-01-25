from typing import Optional
from registration.schema.address import AddressSchema
from ninja import ModelSchema, Field
from registration.models import Contact
from registration.constants import AUDIT_FIELDS


class ContactSchema(ModelSchema):
    """
    Schema for the Contact model
    """

    address: Optional[AddressSchema]

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return str(obj.phone_number)

    class Config:
        model = Contact
        contact_id: int = Field(..., alias="id")
        address_id: int = Field(None, alias="address.id")

        model_exclude = [
            # exclude fields that are included as aliases above
            *AUDIT_FIELDS,
            "id",
            "address",
        ]
