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
