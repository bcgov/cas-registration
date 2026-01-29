from dataclasses import dataclass
import dataclasses
from typing import Self
import uuid
from reporting.api_v2.response_builder import ResponseBuilder
from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion


"""
    Basic implementation of a builder pattern to put together API
    responses for the different reporting enpoints.

    This builder makes responses for the various forms, but other builders
    could be written for standalone pages, or more complex requests.
"""


@dataclass
class ReportData:
    reporting_year: int
    report_version_id: int


@dataclass
class FacilityData:
    facility_type: str


@dataclass
class ReportOperationOptOutStatus:
    operation_opted_out_final_reporting_year: int | None


class FormResponseBuilder(ResponseBuilder):
    """
    Builder that extends the base ResponseBuilder. For Reporting form GET requests.

    It's meant to be a configurable
    """

    def __init__(self, report_version_id: int):
        report_version = ReportVersion.objects.select_related("report").get(pk=report_version_id)
        report_data = ReportData(
            reporting_year=report_version.report.reporting_year_id,
            report_version_id=report_version.id,
        )

        self.report_version_id = report_version_id
        self.response = {
            "report_data": dataclasses.asdict(report_data),
        }

    def facility_data(self, facility_id: uuid.UUID) -> Self:
        facility_report = FacilityReport.objects.get(report_version_id=self.report_version_id, facility_id=facility_id)
        facility_data = FacilityData(facility_type=facility_report.facility_type)

        self.response["facility_data"] = dataclasses.asdict(facility_data)
        return self

    def report_operation_opt_out_status(self, operation_opted_out_final_reporting_year: int | None) -> Self:
        opt_out_status = ReportOperationOptOutStatus(
            operation_opted_out_final_reporting_year=operation_opted_out_final_reporting_year
        )
        self.response["report_operation"] = dataclasses.asdict(opt_out_status)
        return self
