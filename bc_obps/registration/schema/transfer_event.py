import re
from typing import Annotated, Dict, List, Literal, Optional, Union
from uuid import UUID

from django.db.models import Q
from ninja import Field, FilterSchema, ModelSchema

from common.utils import format_decimal
from registration.models import Facility, TransferEvent


class TransferEventListOut(ModelSchema):
    operation__id: Optional[UUID] = None
    operation__name: Optional[str] = Field(None, alias="operation__name")
    facilities__name: Optional[str] = Field(None, alias="facilities__name")
    facility__id: Optional[UUID] = Field(None, alias="facilities__id")

    class Meta:
        model = TransferEvent
        fields = ['id', 'effective_date', 'status', 'created_at']


class TransferEventFilterSchema(FilterSchema):
    effective_date: Annotated[str | None, Field(q='effective_date__icontains')] = None
    operation__name: str | None = None  # Uses custom filter method below
    facilities__name: Annotated[str | None, Field(q='facilities__name__icontains')] = None
    status: Annotated[str | None, Field(q='status__icontains')] = None

    @staticmethod
    def filtering_including_not_applicable(field: str, value: str) -> Q:
        if value and re.search(value, 'n/a', re.IGNORECASE):
            # We show "N/A" on the frontend if a field is null in the db.
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


FacilitiesNameType = List[Dict[str, Union[str, UUID]]]


class TransferEventOut(ModelSchema):
    transfer_entity: str
    from_operator: str = Field(alias="from_operator.legal_name")
    from_operator_id: UUID = Field(alias="from_operator.id")
    to_operator: str = Field(alias="to_operator.legal_name")
    operation_name: Optional[str] = Field(None, alias="operation.name")
    from_operation: Optional[str] = Field(None, alias="from_operation.name")
    from_operation_id: Optional[UUID] = Field(None, alias="from_operation.id")
    to_operation: Optional[str] = Field(None, alias="to_operation.name")
    # This is only required to display the existing facilities in the frontend in the format "Facility (lat, long)"
    existing_facilities: FacilitiesNameType

    class Meta:
        model = TransferEvent
        fields = ['status', 'effective_date', 'operation', 'facilities']

    @staticmethod
    def resolve_transfer_entity(obj: TransferEvent) -> str:
        return "Facility" if obj.facilities.exists() else "Operation"

    @staticmethod
    def resolve_existing_facilities(obj: TransferEvent) -> FacilitiesNameType:
        def format_facility_name(facility: Facility) -> str:
            if (
                facility.latitude_of_largest_emissions is not None
                and facility.longitude_of_largest_emissions is not None
            ):
                return f"{facility.name} ({format_decimal(facility.latitude_of_largest_emissions)}, {format_decimal(facility.longitude_of_largest_emissions)})"
            return facility.name

        if not obj.facilities.exists():
            return []

        return [
            {
                "id": facility.id,
                "name": format_facility_name(facility),
            }
            for facility in obj.facilities.all()
        ]


class TransferEventUpdateIn(ModelSchema):
    transfer_entity: Literal["Operation", "Facility"]
    operation: Optional[UUID] = None
    facilities: Optional[List[UUID]] = None

    class Meta:
        model = TransferEvent
        fields = ['effective_date']
