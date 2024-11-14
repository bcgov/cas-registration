from typing import Optional
from uuid import UUID

from registration.models.facility import Facility
from registration.models.event.transfer_event import TransferEvent
from ninja import ModelSchema, Field, FilterSchema
from django.db.models import Q
import re
from typing import Dict, Any


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
    def resolve_id(obj: Dict[str, Any]) -> UUID:
        operation_id = obj.get('operation__id', None)
        facility_id = obj.get('facilities__id', None)

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
    operation__name: Optional[str] = None
    facilities__name: Optional[str] = Field(None, json_schema_extra={'q': 'facilities__name__icontains'})
    status: Optional[str] = Field(None, json_schema_extra={'q': 'status__icontains'})

    def filtering_including_not_applicable(self, field: str, value: str) -> Q:
        if value and re.search(value, 'n/a', re.IGNORECASE):
            return Q(**{f"{field}__icontains": value}) | Q(**{f"{field}__isnull": True})
        return Q(**{f"{field}__icontains": value}) if value else Q()

    def filter_operation__name(self, value: str) -> Q:
        return self.filtering_including_not_applicable('operation__name', value)

    def filter_facilities__name(self, value: str) -> Q:
        return self.filtering_including_not_applicable('facilities__name', value)
