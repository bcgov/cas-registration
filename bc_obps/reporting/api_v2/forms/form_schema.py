from typing import Generic, Optional, TypeVar
from ninja import Schema

TPayload = TypeVar('TPayload', bound='Schema')


class CommonProgramDataSchema(Schema):
    reporting_year: Optional[int]
    report_version_id: Optional[int]


class CommonFacilityDataSchema(Schema):
    facility_type: Optional[str]


class ReportingFormSchema(Schema, Generic[TPayload]):
    payload: TPayload
    report_data: Optional[CommonProgramDataSchema] = None
    facility_data: Optional[CommonFacilityDataSchema] = None
