from uuid import UUID
from ninja import Schema


class StartReportIn(Schema):
    """
    Schema for the start report endpoint request
    """

    operation_id: UUID
    reporting_year: int
