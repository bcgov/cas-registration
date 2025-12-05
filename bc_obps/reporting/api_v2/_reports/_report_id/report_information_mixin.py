import dataclasses
from dataclasses import dataclass
from typing import Self
from reporting.models.report import Report


@dataclass
class ReportData:
    reporting_year: int
    operation_name: str


class ReportInformationMixin:
    response: dict

    def report(self, report_id: int) -> Self:
        report = Report.objects.select_related('operation').get(pk=report_id)
        report_data = ReportData(reporting_year=report.reporting_year_id, operation_name=report.operation.name)

        self.response["report_data"] = dataclasses.asdict(report_data)

        return self
