from typing import Generic, Optional, TypeVar
from ninja import Schema

TPayload = TypeVar('TPayload', bound='Schema')


class CommonProgramDataSchema(Schema):
    reporting_year: Optional[int]
    report_version_id: Optional[int]


class ReportingFormSchema(Schema, Generic[TPayload]):
    payload: TPayload
    program_data: Optional[CommonProgramDataSchema] = None  # Optional
