from typing import Optional
from registration.schema.v1.address import AddressSchema
from ninja import ModelSchema, Field, FilterSchema
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


class ContactListOut(ModelSchema):
    class Config:
        model = Contact
        model_fields = ['id', 'first_name', 'last_name', 'email']


class ContactFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    first_name: Optional[str] = Field(None, json_schema_extra={'q': 'first_name__icontains'})
    last_name: Optional[str] = Field(None, json_schema_extra={'q': 'last_name__icontains'})
    email: Optional[str] = Field(None, json_schema_extra={'q': 'email__icontains'})
