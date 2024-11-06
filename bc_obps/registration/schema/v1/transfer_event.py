from typing import List, Optional
from registration.models.facility import Facility
from registration.models.event.transfer_event import TransferEvent
from ninja import ModelSchema, Field, FilterSchema


class FacilityForTransferEventGrid(ModelSchema):
    class Meta:
        model = Facility
        fields = ['name']


class TransferEventListOut(ModelSchema):
    operation: str = Field(None, alias="operation.name")
    facilities: Optional[List[FacilityForTransferEventGrid]] = None

    class Meta:
        model = TransferEvent
        fields = ['id', 'effective_date', 'status']


class TransferEventFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    effective_date: Optional[str] = Field(None, json_schema_extra={'q': 'effective_date__icontains'})
    operation: Optional[str] = Field(None, json_schema_extra={'q': 'operation__name__icontains'})
    facilities: Optional[str] = Field(None, json_schema_extra={'q': 'facilities__icontains'})
    status: Optional[str] = Field(None, json_schema_extra={'q': 'status__icontains'})
