from datetime import date
from typing import Annotated
from uuid import UUID

from ninja import Field, FilterSchema, Schema


class IssuanceOut(Schema):
    id: UUID
    account_id: int = Field(..., alias="issuance.account_id")
    project_id: int
    account_name: str = Field(..., alias="issuance.account.name")
    project_name: str = Field(..., alias="project.name")
    project_type: str = Field(..., alias="project.project_type")
    operation_name: str = Field(..., alias="project.operation.name")
    status: str
    vintage_year: str = Field(..., alias="vintage")
    issuance_year: int | None
    serial_number: str
    verifier_name: str = Field(..., alias="issuance.verifier.name")
    unit_quantity: int = Field(..., alias="quantity")
    unit_class: str = Field(..., alias="unit_type")


class IssuanceFilterSchema(FilterSchema):
    status: Annotated[str | None, Field(q="issuance__status")] = None
    account: Annotated[int | None, Field(q="issuance__account_id")] = None
    project: Annotated[int | None, Field(q="project_id")] = None
    verifier: Annotated[UUID | None, Field(q="issuance__verifier_id")] = None
    request_date: Annotated[date | None, Field(q="issuance__request_date")] = None
    issuance_date: Annotated[date | None, Field(q="issuance__issuance_date")] = None