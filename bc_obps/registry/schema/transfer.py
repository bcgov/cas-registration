from typing import Annotated
from uuid import UUID

from common.constants import AUDIT_FIELDS
from ninja import Field, FilterSchema, ModelSchema

from registry.models.transfer import Transfer


class TransferOut(ModelSchema):
    id: int
    source_account_name: str = Field(..., alias="source_account.name")
    destination_account_name: str = Field(..., alias="destination_account.name")

    class Meta:
        model = Transfer
        exclude = [*AUDIT_FIELDS]


class TransferFilterSchema(FilterSchema):
    status: Annotated[str | None, Field(q='status')] = None
    source_account: Annotated[int | None, Field(q='source_account_id')] = None
    destination_account: Annotated[int | None, Field(q='destination_account_id')] = None
    project: Annotated[int | None, Field(q='project_id')] = None
    requested_by: Annotated[UUID | None, Field(q='requested_by_id')] = None
    reviewed_by: Annotated[UUID | None, Field(q='reviewed_by_id')] = None
    transfer_quantity: Annotated[int | None, Field(q='transfer_quantity')] = None
    vintage: Annotated[str | None, Field(q='vintage__icontains')] = None
