from typing import Optional
from registration.schema.address import AddressSchema
from ninja import ModelSchema
from registration.models import Contact


class ContactSchema(ModelSchema):
    """
    Schema for the Contact model
    """

    address: Optional[AddressSchema] = None

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return str(obj.phone_number)

    class Config:
        model = Contact
        model_fields = [
            "id",
            "first_name",
            "last_name",
            "business_role",
            "email",
            "phone_number",
            "position_title",
        ]
