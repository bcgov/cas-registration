from typing import Optional
from registration.schema.v1.address import AddressSchema
from ninja import ModelSchema, Field
from registration.models import Contact
from common.constants import AUDIT_FIELDS


class ContactSchema(ModelSchema):
    """
    Schema for the Contact model
    """

    address: Optional[AddressSchema]

    @staticmethod
    def resolve_phone_number(obj: Contact) -> Optional[str]:
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return None
        return str(obj.phone_number)

    class Config:
        model = Contact
        contact_id: int = Field(..., alias="id")
        address_id: Optional[int] = Field(None, alias="address.id")

        model_exclude = [
            # exclude fields that are included as aliases above
            *AUDIT_FIELDS,
            "id",
            "address",
        ]
