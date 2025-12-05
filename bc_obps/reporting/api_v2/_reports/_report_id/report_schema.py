from ninja import Schema
from reporting.api_v2.schema import ReportingResponseSchema


class ReportData(Schema):
    reporting_year: int
    operation_name: str


class ReportingReportResponseSchema(ReportingResponseSchema):
    report_data: ReportData
