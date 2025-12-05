from typing import Optional
from ninja import Schema
from reporting.api_v2.schema import ReportingResponseSchema


class CommonProgramDataSchema(Schema):
    reporting_year: Optional[int]
    report_version_id: Optional[int]


class CommonFacilityDataSchema(Schema):
    facility_type: Optional[str]


class ReportingFormSchema(ReportingResponseSchema):
    report_data: Optional[CommonProgramDataSchema] = None
    facility_data: Optional[CommonFacilityDataSchema] = None
