from typing import Optional
from ninja import ModelSchema, Field
from registration.models import Contact
from itertools import count
from ninja import FilterSchema

_id_generator = count(1)


class ContactListOutV2(ModelSchema):
    operators__legal_name: Optional[str] = None
    id: int = Field(default_factory=lambda: next(_id_generator))  # Auto-incrementing ID

    class Meta:
        model = Contact
        fields = ['first_name', 'last_name', 'email']


class ContactFilterSchemaV2(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    first_name: Optional[str] = Field(None, json_schema_extra={'q': 'first_name__icontains'})
    last_name: Optional[str] = Field(None, json_schema_extra={'q': 'last_name__icontains'})
    email: Optional[str] = Field(None, json_schema_extra={'q': 'email__icontains'})
    operators__legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'operators__legal_name__icontains'})
