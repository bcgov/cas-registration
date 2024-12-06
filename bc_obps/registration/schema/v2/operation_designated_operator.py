from uuid import UUID
from ninja import Field, Schema


class OperationDesignatedOperatorTimelineOut(Schema):
    id: UUID = Field(..., alias="operation.id")
    name: str = Field(..., alias="operation.name")
