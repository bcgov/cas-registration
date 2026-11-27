from typing import Generic, TypeVar

from ninja import Schema

TPayload = TypeVar("TPayload", bound="Schema")

"""
Generic schema for standard typed payload
"""


class ReportingResponseSchema(Schema, Generic[TPayload]):
    payload: TPayload


"""
Generic schemas for paginated typed payload
"""


class Paginated(Schema, Generic[TPayload]):
    items: list[TPayload]
    count: int


class PaginatedReportingResponseSchema(Schema, Generic[TPayload]):
    payload: Paginated[TPayload]
