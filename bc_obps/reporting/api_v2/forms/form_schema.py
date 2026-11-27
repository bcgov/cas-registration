from typing import Generic, Optional, TypeVar
from uuid import UUID

from ninja import Schema
from reporting.api_v2.schema import ReportingResponseSchema

TPayload = TypeVar("TPayload", bound="Schema")


class CommonProgramDataSchema(Schema):
    reporting_year: int | None
    report_version_id: int | None


class CommonFacilityDataSchema(Schema):
    facility_id: UUID | None = None
    facility_type: str | None
    facility_name: str | None = None


class CommonOperationDataSchema(Schema):
    naics_code: str | None
    operation_type: str
    is_operation_opted_out: bool


class ReportingFormSchema(ReportingResponseSchema[TPayload], Generic[TPayload]):
    report_data: CommonProgramDataSchema | None = None
    facility_data: CommonFacilityDataSchema | None = None
    operation_data: CommonOperationDataSchema | None = None
