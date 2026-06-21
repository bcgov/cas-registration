from typing import Optional
from ninja import Schema


class ErrorDetail(Schema):
    severity: str
    message: str


class ErrorItem(Schema):
    key: str
    error: ErrorDetail


# Generic schemas
class Message(Schema):
    message: str
    errors: Optional[list[ErrorItem]] = None
