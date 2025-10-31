from typing import Generic, Optional, TypeVar
from ninja import Schema

TPayload = TypeVar('TPayload', bound='Schema')


class ReportingBaseSchema(Schema, Generic[TPayload]):
    payload: TPayload
    data: Optional[dict] = {}
