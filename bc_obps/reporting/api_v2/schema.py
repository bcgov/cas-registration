from typing import Generic, TypeVar
from ninja import Schema

TPayload = TypeVar('TPayload', bound='Schema')


class ReportingResponseSchema(Schema, Generic[TPayload]):
    payload: TPayload
