from typing import Optional, List, Literal
from uuid import UUID

from ninja import ModelSchema
from registration.models import TransferEvent


class TransferEventCreateIn(ModelSchema):
    transfer_entity: Literal["Operation", "Facility"]
    from_operator: UUID
    to_operator: UUID
    operation: Optional[UUID] = None
    from_operation: Optional[UUID] = None
    to_operation: Optional[UUID] = None
    facilities: Optional[List] = None

    class Meta:
        model = TransferEvent
        fields = ['effective_date']


class TransferEventOut(ModelSchema):
    transfer_entity: str

    class Meta:
        model = TransferEvent
        fields = [
            'from_operator',
            'to_operator',
            'effective_date',
            'operation',
            'from_operation',
            'to_operation',
            'facilities',
        ]

    @staticmethod
    def resolve_transfer_entity(obj: TransferEvent) -> str:
        return "Facility" if obj.facilities.exists() else "Operation"
