from dataclasses import dataclass
from enum import Enum, StrEnum
from typing import Any


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


class UserErrorKey(StrEnum):
    GENERIC_ERROR = "generic_error"


class SerializableError:
    """
    Base interface for frontend-facing errors that can be serialized
    into API response payloads.
    """

    key: Any

    def serialize(self) -> dict[str, Any]:
        raise NotImplementedError


@dataclass(init=False)
class UserError(Exception, SerializableError):
    """
    Base class for user-facing errors.

    These errors are intended to provide structured feedback to the frontend.

    Attributes:
        severity: The type/severity of the error (e.g. warning vs error)
        message: Human-readable explanation for the user
        key: Stable frontend identifier used for rendering/handling
        context: Optional metadata related to the error
    """

    message: str
    severity: Severity = Severity.ERROR
    key: UserErrorKey = UserErrorKey.GENERIC_ERROR
    context: dict[str, Any] | None = None

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

    def serialize(self) -> dict[str, Any]:
        return {
            "severity": self.severity.value,
            "message": self.message,
            "key": self.key.value,
            "context": self.context,
        }
