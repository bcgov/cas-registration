from typing import Any
from ninja import Schema


class UserErrorDetailSchema(Schema):
    severity: str
    message: str
    context: dict[str, Any] | None = None


class UserErrorSchema(Schema):
    key: str
    error: UserErrorDetailSchema


class UserErrorResponseSchema(Schema):
    errors: list[UserErrorSchema]
