from typing import Annotated, Optional
from uuid import UUID

from common.constants import AUDIT_FIELDS
from ninja import Field, FilterSchema, ModelSchema
from registry.models.account import Account

class AccountOut(ModelSchema):
    id: int

    class Meta:
        model = Account
        exclude = [*AUDIT_FIELDS]

class AccountFilterSchema(FilterSchema):
    name: Annotated[str | None, Field(q='name__icontains')] = None
    status: Annotated[str | None, Field(q='status')] = None
    website: Annotated[str | None, Field(q='website__icontains')] = None
    account_type: Annotated[str | None, Field(q='account_type')] = None
    account_classification: Annotated[str | None, Field(q='account_classification')] = None
    country: Annotated[str | None, Field(q='country__icontains')] = None
    operation: Annotated[UUID | None, Field(q='operation_id')] = None