from uuid import UUID

from ninja import ModelSchema, Field, FilterSchema
from pydantic import alias_generators
from typing import List, Optional

from reporting.models import FacilityReport


def to_camel(string: str) -> str:
    return alias_generators.to_camel(string)


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class FacilityReportOut(ModelSchema):
    """
    Schema for the get report facility endpoint request output
    """

    @staticmethod
    def resolve_facility(obj: FacilityReport) -> str:
        return str(obj.facility)

    class Meta:
        alias_generator = to_snake
        model = FacilityReport
        fields = ['facility_name', 'facility_type', 'facility_bcghgid', 'activities', 'facility']


class FacilityReportIn(ModelSchema):
    """
    Schema for the save report activity endpoint request input
    """

    facility_name: str
    facility_type: str
    facility_bcghgid: Optional[str]
    activities: List[str]

    class Meta:
        alias_generator = to_snake
        model = FacilityReport
        fields = ['facility_name', 'facility_type', 'facility_bcghgid', 'activities']


class FacilityReportListSchema(ModelSchema):
    class Meta:
        alias_generator = to_snake
        model = FacilityReport
        fields = ['id', 'facility_name', 'facility', 'facility_bcghgid', 'is_completed']


class FacilityReportListInSchema(ModelSchema):
    facility: UUID = Field(alias='facility')
    is_completed: bool

    class Meta:
        alias_generator = to_snake
        model = FacilityReport
        fields = ['is_completed']


class FacilityReportFilterSchema(FilterSchema):
    facility_name: Optional[str] = Field(None, json_schema_extra={'q': 'facility_name__icontains'})
    facility_bcghgid: Optional[str] = Field(None, json_schema_extra={'q': 'facility_bcghgid__icontains'})
