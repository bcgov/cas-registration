from typing import Optional
from uuid import UUID

from registration.models.facility import Facility
from registration.models.event.transfer_event import TransferEvent
from ninja import ModelSchema, Field, FilterSchema


class FacilityForTransferEventGrid(ModelSchema):
    class Meta:
        model = Facility
        fields = ['name']


class TransferEventListOut(ModelSchema):
    operation__id: Optional[UUID] = None
    operation__name: Optional[str] = Field(None, alias="operation__name")
    facilities__name: Optional[str] = Field(None, alias="facilities__name")
    facility__id: Optional[UUID] = Field(None, alias="facilities__id")
    id: UUID

    @staticmethod
    def resolve_id(obj: TransferEvent) -> UUID:
        operation_id = getattr(obj, 'operation__id', None)
        facility_id = getattr(obj, 'facilities__id', None)

        record_id = operation_id if operation_id else facility_id
        if not isinstance(record_id, UUID):
            raise Exception('Missing valid UUID')
        return record_id

    class Meta:
        model = TransferEvent
        fields = ['effective_date', 'status', 'created_at']


class TransferEventFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    effective_date: Optional[str] = Field(None, json_schema_extra={'q': 'effective_date__icontains'})
    operation__name: Optional[str] = Field(None, json_schema_extra={'q': 'operation__name__icontains'})
    facilities__name: Optional[str] = Field(None, json_schema_extra={'q': 'facilities__name__icontains'})
    status: Optional[str] = Field(None, json_schema_extra={'q': 'status__icontains'})
