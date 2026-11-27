from typing import Annotated, Optional
from uuid import UUID

from ninja import Field, FilterSchema, ModelSchema, Schema
from pydantic import ConfigDict
from registration.models import Contact


class ContactOut(ModelSchema):
    street_address: str | None = Field(None, alias="address.street_address")
    municipality: str | None = Field(None, alias="address.municipality")
    province: str | None = Field(None, alias="address.province")
    postal_code: str | None = Field(None, alias="address.postal_code")
    places_assigned: list | None = None

    model_config = ConfigDict(populate_by_name=True)

    @staticmethod
    def resolve_phone_number(obj: Contact) -> str:
        return str(obj.phone_number)

    class Meta:
        model = Contact
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "position_title",
            "business_role",
        ]


class PlacesAssigned(Schema):
    role_name: str
    operation_name: str
    operation_id: UUID


class ContactWithPlacesAssigned(ContactOut):
    places_assigned: list[PlacesAssigned] | None = []


class ContactListOut(ModelSchema):
    operator__legal_name: str = Field(..., alias="operator.legal_name")

    class Meta:
        model = Contact
        fields = ["id", "first_name", "last_name", "email"]


class ContactFilterSchema(FilterSchema):
    first_name: Annotated[str | None, Field(q="first_name__icontains")] = None
    last_name: Annotated[str | None, Field(q="last_name__icontains")] = None
    email: Annotated[str | None, Field(q="email__icontains")] = None
    operator__legal_name: Annotated[
        str | None, Field(q="operator__legal_name__icontains")
    ] = None
    operator_id: Annotated[UUID | None, Field(q="operator_id")] = None


class OperationRepresentativeListOut(Schema):
    id: int = Field(..., alias="pk")
    full_name: str

    @staticmethod
    def resolve_full_name(obj: Contact) -> str:
        return f"{obj.first_name} {obj.last_name}"


class ContactIn(ModelSchema):
    street_address: str | None = None
    municipality: str | None = None
    province: str | None = None
    postal_code: str | None = None

    class Meta:
        model = Contact
        fields = ["first_name", "last_name", "email", "phone_number", "position_title"]
