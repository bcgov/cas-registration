from dataclasses import dataclass
import dataclasses
from reporting.models.report_version import ReportVersion


"""
    Basic implementation of a builder pattern to put together API
    responses for the different reporting enpoints.

    This builder makes responses for the various forms, but other builders
    could be written for standalone pages, or more complex requests.
"""


@dataclass
class ProgramData:
    reporting_year: int
    report_version_id: int


class FormResponseBuilder:
    """
    Builder to make API responses for reporting form GET requests.

    Note: This could be extended with a plugin or configuration pattern, to allow the builder to assemble multiple
    pieces: program data, tasklist data, json schemas, etc.
    """

    @staticmethod
    def build(report_version_id: int, payload: dict = {}) -> dict:
        report_version = ReportVersion.objects.select_related("report").get(pk=report_version_id)

        program_data = ProgramData(
            reporting_year=report_version.report.reporting_year_id,
            report_version_id=report_version.id,
        )

        return {
            "program_data": dataclasses.asdict(program_data),
            "payload": payload,
        }
