from dataclasses import dataclass
from enum import Enum, StrEnum
from typing import Any


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


class UserErrorKey(StrEnum):
    GENERIC_ERROR = "generic_error"


@dataclass(init=False)
class UserError(Exception):
    """
    Base class for user-facing errors.

    These errors are intended to provide structured feedback to the frontend.

    Attributes:
        severity: The type/severity of the error (e.g. warning vs error)
        message: Human-readable explanation for the user
        key: Stable frontend identifier used for rendering/handling
        context: Optional metadata related to the error
    """

    severity: Severity
    message: str
    key: UserErrorKey
    context: dict[str, Any] | None

    def __init__(
        self,
        message: str,
        severity: Severity = Severity.ERROR,
        key: UserErrorKey = UserErrorKey.GENERIC_ERROR,
        context: dict[str, Any] | None = None,
    ) -> None:
        self.severity = severity
        self.message = message
        self.key = key
        self.context = context
        super().__init__(message)
