import dataclasses
from dataclasses import dataclass

from reporting.api_v2._reports._report_id.report_reponse_builder import ReportInformationMixin
from reporting.api_v2.response_builder import PaginatedResponseBuilder, ResponseBuilder
from reporting.models.report import Report


@dataclass
class ReportData:
    reporting_year: int
    operation_name: str


class ReportHistoryResponseBuilder(PaginatedResponseBuilder, ReportInformationMixin):
    pass
