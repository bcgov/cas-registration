from typing import Annotated
from uuid import UUID

from common.constants import AUDIT_FIELDS
from ninja import Field, FilterSchema, ModelSchema

from registry.models.unit import Unit


class UnitOut(ModelSchema):
    id: UUID

    class Meta:
        model = Unit
        exclude = [*AUDIT_FIELDS]


class UnitFilterSchema(FilterSchema):
    serial_number: Annotated[str | None, Field(q='serial_number__icontains')] = None
    status: Annotated[str | None, Field(q='status')] = None
    unit_type: Annotated[str | None, Field(q='unit_type')] = None
    vintage: Annotated[str | None, Field(q='vintage__icontains')] = None
    measurement: Annotated[str | None, Field(q='measurement__icontains')] = None
    quantity: Annotated[int | None, Field(q='quantity')] = None
    program: Annotated[int | None, Field(q='program_id')] = None
    project: Annotated[int | None, Field(q='project_id')] = None
    account: Annotated[int | None, Field(q='issuance__account_id')] = None
