from typing import Generic, Optional, TypeVar
from ninja import Schema
from reporting.api_v2.schema import ReportingResponseSchema

TPayload = TypeVar('TPayload', bound='Schema')


class CommonProgramDataSchema(Schema):
    reporting_year: Optional[int]
    report_version_id: Optional[int]


class CommonFacilityDataSchema(Schema):
    facility_type: Optional[str]


class CommonOperationDataSchema(Schema):
    naics_code: Optional[str]
    operation_type: Optional[str]


class ReportingFormSchema(ReportingResponseSchema[TPayload], Generic[TPayload]):
    report_data: Optional[CommonProgramDataSchema] = None
    facility_data: Optional[CommonFacilityDataSchema] = None
    operation_data: Optional[CommonOperationDataSchema] = None
