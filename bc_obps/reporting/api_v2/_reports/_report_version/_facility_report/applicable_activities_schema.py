from typing import TypeVar, Generic
from ninja import Schema
from reporting.api_v2.schema import ReportingResponseSchema

TPayload = TypeVar('TPayload', bound=Schema)


class FacilityReportResponseSchema(ReportingResponseSchema[TPayload], Generic[TPayload]):
    applicable_activities: list
