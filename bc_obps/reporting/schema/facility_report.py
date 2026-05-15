from typing import Annotated, List, Optional
from uuid import UUID
from ninja import Field, FilterSchema, ModelSchema
from pydantic import alias_generators
from reporting.models import FacilityReport
from reporting.schema.report_operation import ActivitySchema


class FacilityReportOut(ModelSchema):
    """
    Schema for the get report facility endpoint request output
    """

    @staticmethod
    def resolve_facility(obj: FacilityReport) -> str:
        return str(obj.facility)

    class Meta:
        alias_generator = alias_generators.to_snake
        model = FacilityReport
        fields = ['facility_name', 'facility_type', 'facility_bcghgid', 'activities', 'facility']

    operation_id: Optional[UUID] = None
    is_sync_allowed: bool = True
    report_operation_activities: List[ActivitySchema] = []
    other_activities: List[ActivitySchema] = []


class FacilityReportIn(ModelSchema):
    """
    Schema for the save report activity endpoint request input
    """

    facility_name: str
    facility_type: str
    facility_bcghgid: Optional[str]
    activities: List[int]

    class Meta:
        alias_generator = alias_generators.to_snake
        model = FacilityReport
        fields = ['facility_name', 'facility_type', 'facility_bcghgid', 'activities']


class FacilityReportListSchema(ModelSchema):
    class Meta:
        alias_generator = alias_generators.to_snake
        model = FacilityReport
        fields = ['id', 'facility_name', 'facility', 'facility_bcghgid', 'is_completed']


class FacilityReportListInSchema(ModelSchema):
    facility: UUID = Field(alias='facility')
    is_completed: bool

    class Meta:
        alias_generator = alias_generators.to_snake
        model = FacilityReport
        fields = ['is_completed']


class FacilityReportFilterSchema(FilterSchema):
    facility_name: Annotated[str | None, Field(q='facility_name__icontains')] = None
    facility_bcghgid: Annotated[str | None, Field(q='facility_bcghgid__icontains')] = None
