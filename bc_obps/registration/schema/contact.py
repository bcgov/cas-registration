from typing import Annotated, Optional
from uuid import UUID

from ninja import Field, FilterSchema, ModelSchema, Schema
from registration.models import Contact


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


class ContactFilterSchema(FilterSchema):
    first_name: Annotated[str | None, Field(q='first_name__icontains')] = None
    last_name: Annotated[str | None, Field(q='last_name__icontains')] = None
    email: Annotated[str | None, Field(q='email__icontains')] = None
    operator__legal_name: Annotated[str | None, Field(q='operator__legal_name__icontains')] = None
    operator_id: Annotated[UUID | None, Field(q='operator_id')] = None


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
