import dataclasses
from dataclasses import dataclass

from reporting.api_v2.response_builder import PaginatedResponseBuilder, ResponseBuilder
from reporting.models.report import Report


@dataclass
class ReportData:
    reporting_year: int
    operation_name: str


class PaginatedReportResponseBuilder(PaginatedResponseBuilder):

    def __init__(self, report_id: int, page: int, page_size: int):
        super().__init__(page, page_size)
        report = Report.objects.select_related('operation').get(pk=report_id)
        report_data = ReportData(reporting_year=report.reporting_year_id, operation_name=report.operation.name)

        self.response = {
            "report_data": dataclasses.asdict(report_data),
        }

class ReportInformationMixin:
    def report(self, report_id: int):
        report = Report.objects.select_related('operation').get(pk=report_id)
        report_data = ReportData(reporting_year=report.reporting_year_id, operation_name=report.operation.name)
        self.response = {
            "report_data": dataclasses.asdict(report_data),
        }
