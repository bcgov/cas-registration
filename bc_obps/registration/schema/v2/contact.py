from typing import Optional
from ninja import ModelSchema, Field
from registration.models import Contact
from ninja import FilterSchema
from uuid import UUID


from registration.schema.v1.contact import ContactOut
from ninja import Schema


class PlacesAssigned(Schema):
    role_name: str
    operation_name: str
    operation_id: UUID


class ContactWithPlacesAssigned(ContactOut):
    places_assigned: Optional[list[PlacesAssigned]]


class ContactListOutV2(ModelSchema):
    operators__legal_name: Optional[str] = None

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
    operators__legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'operators__legal_name__icontains'})
