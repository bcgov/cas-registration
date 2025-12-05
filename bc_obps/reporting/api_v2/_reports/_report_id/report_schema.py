from ninja import Schema
from reporting.api_v2.schema import PaginatedReportingResponseSchema


class ReportData(Schema):
    reporting_year: int
    operation_name: str


class ReportingReportResponseSchema(PaginatedReportingResponseSchema):
    report_data: ReportData
