from typing import TypeVar, Generic
from ninja import Schema
from reporting.api_v2.schema import PaginatedReportingResponseSchema

TPayload = TypeVar('TPayload', bound=Schema)


class ReportData(Schema):
    reporting_year: int
    operation_name: str


class ReportingReportResponseSchema(PaginatedReportingResponseSchema[TPayload], Generic[TPayload]):
    report_data: ReportData
