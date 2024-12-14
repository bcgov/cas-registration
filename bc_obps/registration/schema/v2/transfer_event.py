import uuid
from typing import Optional, List, Literal
from uuid import UUID
from ninja import ModelSchema, Field, FilterSchema
from registration.models import TransferEvent
from django.db.models import Q
import re


class TransferEventListOut(ModelSchema):
    operation__id: Optional[UUID] = None
    operation__name: Optional[str] = Field(None, alias="operation__name")
    facilities__name: Optional[str] = Field(None, alias="facilities__name")
    facility__id: Optional[UUID] = Field(None, alias="facilities__id")
    id: UUID = Field(default_factory=uuid.uuid4)

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

    @staticmethod
    def filtering_including_not_applicable(field: str, value: str) -> Q:
        if value and re.search(value, 'n/a', re.IGNORECASE):
            return Q(**{f"{field}__icontains": value}) | Q(**{f"{field}__isnull": True})
        return Q(**{f"{field}__icontains": value}) if value else Q()

    def filter_operation__name(self, value: str) -> Q:
        return self.filtering_including_not_applicable('operation__name', value)

    def filter_facilities__name(self, value: str) -> Q:
        return self.filtering_including_not_applicable('facilities__name', value)


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
