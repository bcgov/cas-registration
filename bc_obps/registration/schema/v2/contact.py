from typing import Optional
from ninja import ModelSchema, Field, Schema
from pydantic import Field

from registration.models import Contact
from ninja import FilterSchema
from uuid import UUID
from ninja import Schema


class ContactOut(ModelSchema):
    street_address: Optional[str] = Field(None, alias="address.street_address")
    municipality: Optional[str] = Field(None, alias="address.municipality")
    province: Optional[str] = Field(None, alias="address.province")
    postal_code: Optional[str] = Field(None, alias="address.postal_code")
    places_assigned: Optional[list] = None

    @staticmethod
    def resolve_phone_number(obj: Contact) -> str:
        return str(obj.phone_number)

    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'position_title', 'business_role']
        populate_by_name = True


class PlacesAssigned(Schema):
    role_name: str
    operation_name: str
    operation_id: UUID


class ContactWithPlacesAssigned(ContactOut):
    places_assigned: Optional[list[PlacesAssigned]] = []


class ContactListOut(ModelSchema):
    operator__legal_name: str = Field(..., alias="operator.legal_name")

    class Meta:
        model = Contact
        fields = ['id', 'first_name', 'last_name', 'email']


class ContactFilterSchemaV2(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    first_name: Optional[str] = Field(None, json_schema_extra={'q': 'first_name__icontains'})
    last_name: Optional[str] = Field(None, json_schema_extra={'q': 'last_name__icontains'})
    email: Optional[str] = Field(None, json_schema_extra={'q': 'email__icontains'})
    operator__legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'operator__legal_name__icontains'})


class OperationRepresentativeListOut(Schema):
    id: int = Field(..., alias="pk")
    full_name: str

    @staticmethod
    def resolve_full_name(obj: Contact) -> str:
        return f"{obj.first_name} {obj.last_name}"


class ContactIn(ModelSchema):
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None

    class Meta:
        model = Contact
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'position_title']
