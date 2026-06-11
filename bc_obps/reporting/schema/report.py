from uuid import UUID
from ninja import Schema


class StartReportIn(Schema):
    """
    Schema for the start report endpoint request
    """

    operation_id: UUID
    reporting_year: int


class CreateReportVersionIn(Schema):
    """
    Schema for the create_report_version endpoint request
    """

    operation_id: UUID


class CreateReportForReportingYearIn(Schema):
    """
    Schema for the start report for selected reporting year endpoint request
    """

    operation_id: UUID
    reporting_year: int
    registration_purpose: str
